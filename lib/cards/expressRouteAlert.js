const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

const { whichPeer, setPeerStatus } = require('../helpers');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

exports.messageCard = (alertData) => {
  const { condition } = alertData.alertContext;
  const { firedDateTime, alertId, monitorCondition, alertTargetIDs } =
    alertData.essentials;
  const timestamp = dayjs(firedDateTime).format('ddd, D MMM YYYY hh:mm:ss Z');
  const subscriptionId = alertId.split('/')[2];
  const newStatus = monitorCondition.toLowerCase() === 'resolved';
  const peer = whichPeer(condition.allOf[0].dimensions);
  const updatedStatus = setPeerStatus(peer, newStatus);
  const peersKeys = Object.keys(updatedStatus);
  const totalPeers = peersKeys.length;
  const peersDown = peersKeys.filter(
    (peerKey) => updatedStatus[peerKey] !== true,
  );
  const numPeersDown = peersDown.length;
  const titlePrefix = 'Azure ExpressRoute Alert';
  const title = numPeersDown
    ? `${titlePrefix} (${peersDown.length} of ${totalPeers} down)`
    : titlePrefix;
  // AdaptiveCard color strings
  // good = green, accent = blue, warning = yellow, attention = red, emphasis = gray
  let color = 'accent';
  if (monitorCondition.toLowerCase() === 'resolved') {
    color = 'good';
  }
  if (monitorCondition.toLowerCase() === 'fired') {
    color = 'warning';
  }
  if (numPeersDown && numPeersDown === totalPeers) {
    color = 'attention';
  }
  if (numPeersDown && numPeersDown < totalPeers) {
    color = 'warning';
  }

  const adaptiveCardTemplate = {
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
          body: [
            {
              type: 'Container',
              style: color,
              bleed: true,
              spacing: 'None',
              items: [
                {
                  type: 'TextBlock',
                  size: 'large',
                  weight: 'bolder',
                  spacing: 'none',
                  text: title,
                },
              ],
            },
          ],
        },
      },
    ],
  };

  const sectionOne = {
    type: 'TextBlock',
    text: `${alertData.essentials.description} (${peer})`,
    size: 'Large',
    wrap: true,
  };

  const factSetOne = {
    type: 'FactSet',
    facts: [
      {
        title: 'Subscription ID',
        value: subscriptionId,
      },
      {
        title: 'Alert Timestamp',
        value: timestamp,
      },
      {
        title: 'Affected Peer',
        value: peer,
      },
      {
        title: 'Alert State',
        value: monitorCondition,
      },
    ],
    height: 'stretch',
  };

  const actionSet = {
    type: 'ActionSet',
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'View Alerts in Azure Portal',
        url: `https://portal.azure.com/#@cornellprod.onmicrosoft.com/resource${alertTargetIDs[0]}/alerts`,
      },
    ],
  };

  adaptiveCardTemplate.attachments[0].content.body.push(
    sectionOne,
    factSetOne,
    actionSet,
  );

  return adaptiveCardTemplate;
};
