const {
  storageDefaults,
  getBlobServiceClient,
  getBlobContainerClient,
  getBlobContent,
  uploadFile,
} = require('../lib/storage');

const { AzureWebJobsStorage } = process.env;

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
 * isPrimary
 * @summary returns true if primary expressroute peer
 * @param  {string} peer (ex: "Primary-IPv4")
 * @returns {boolean}
 */
exports.isPrimary = (peer) => peer.toLowerCase().includes('primary');

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
