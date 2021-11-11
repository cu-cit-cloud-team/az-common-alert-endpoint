const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

const {
  storageDefaults,
  getBlobServiceClient,
  getBlobContainerClient,
  getBlobContent,
  uploadFile,
} = require('../lib/storage');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

const { AzureWebJobsStorage } = process.env;

/**
 * getAdaptiveCardTemplate
 * @summary returns object with basic structure for an AdaptiveCard
 * @returns {Object}
 */
exports.getAdaptiveCardTemplate = () => ({
  type: 'message',
  attachments: [
    {
      contentType: 'application/vnd.microsoft.card.adaptive',
      contentUrl: null,
      content: {
        msteams: {
          width: 'Full',
        },
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.3',
        body: [],
      },
    },
  ],
});

/**
 * assembleAdaptiveCard
 * @summary asseembles and returns a full AdaptiveCard object
 * @param  {Array} cardSectionsArray
 * @returns {Object}
 */
exports.assembleAdaptiveCard = (cardSectionsArray) => {
  const cardTemplate = exports.getAdaptiveCardTemplate();
  cardTemplate.attachments[0].content.body.push(...cardSectionsArray);
  return cardTemplate;
};

/**
 * localizeDateTime
 * @summary returns a date/time string formatted for specified timezone
 * @param  {(Date|null)} [date=null] returns current date/time if null
 * @param  {string} [tz=America/New_York]
 * @param  {string} [dateFormat=ddd, D MMM YYYY hh:mm:ss Z] (formatting options: https://day.js.org/docs/en/display/format)
 * @returns {string}
 */
exports.localizeDateTime = ({
  date = null,
  tz = 'America/New_York',
  dateFormat = 'ddd, D MMM YYYY hh:mm:ss Z',
}) =>
  date instanceof Date
    ? dayjs(date).tz(tz).format(dateFormat)
    : dayjs().tz(tz).format(dateFormat);

/**
 * isExpressRouteAlert
 * @summary returns true if the alertId indicates it's for the expressroute
 * @param  {Array} targetIds
 * @returns {boolean}
 */
exports.isExpressRouteAlert = (targetIds) => {
  const result = targetIds.filter((targetId) =>
    targetId.toLowerCase().includes('expressroutecircuits'),
  );
  return Boolean(result.length);
};

/**
 * whichPeer
 * @summary returns the peer that fired the alert
 * @param  {Array} dimensions
 * @returns {string} (e.g. "Primary-IPv4" or "Secondary-IPv4")
 */
exports.whichPeer = (dimensions) => {
  const result = dimensions.filter(
    (dimension) => dimension.name.toLowerCase() === 'peer',
  );
  return result[0].value;
};

/**
 * getPeersStatus
 * @summary returns data from peers status file
 * @returns {string}
 */
exports.getPeersStatus = async () => {
  const blobServiceClient = await getBlobServiceClient(AzureWebJobsStorage);
  const containerClient = await getBlobContainerClient(
    blobServiceClient,
    storageDefaults.blobContainerName,
  );
  const blobContent = await getBlobContent(
    containerClient,
    storageDefaults.peersFileName,
  );
  return blobContent;
};

/**
 * getPeerStatus
 * @summary returns status of an individual peer from peers status file
 * @param  {Object} [peersData=null]
 * @param  {string} [peer='Primary-IPv4']
 * @returns {Boolean} true/false === up/down
 */
exports.getPeerStatus = async ({ peersData = null, peer = 'Primary-IPv4' }) => {
  if (!peersData) {
    peersData = await exports.getPeersStatus();
  }
  return peersData[peer];
};

/**
 * setPeersStatus
 * @summary sets the full data object in peers status file
 * @param  {Object} peersData
 * @returns {void}
 */
exports.setPeersStatus = async (peersData) => {
  await uploadFile({
    storageConnectionString: AzureWebJobsStorage,
    blobContainerName: storageDefaults.blobContainerName,
    fileContent: peersData,
    fileName: storageDefaults.peersFileName,
  });
};

/**
 * setPeerStatus
 * @summary updates status of an individual peer in peer status file
 * @param  {string} peer
 * @param  {boolean} status
 * @param  {Object} [peersData=null]
 * @returns {Object} peers status data object
 */
exports.setPeerStatus = async ({ peer, status, peersData = null }) => {
  if (!peersData || peersData === undefined) {
    peersData = JSON.parse(await exports.getPeersStatus());
  }
  peersData[peer] = Boolean(status);
  await exports.setPeersStatus(peersData);
  const updatedStatus = await exports.getPeersStatus();
  return updatedStatus;
};

/**
 * initPeersStatus
 * @summary looks for peer status file and creates one if not there
 * @returns {void}
 */
exports.initPeersStatus = async () => {
  try {
    const currentStatus = await exports.getPeersStatus();
    return currentStatus;
  } catch (error) {
    await exports.setPeersStatus(storageDefaults.peersDefaultContent);
  }
};
