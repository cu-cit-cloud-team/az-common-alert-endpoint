const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

const { initPeersStatus, setPeerStatus, whichPeer } = require('../helpers');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

exports.messageCard = async (alertData) => {
  await initPeersStatus();
  const { condition } = alertData.alertContext;
  const {
    firedDateTime,
    alertId,
    monitorCondition,
    alertTargetIDs,
    alertRule,
  } = alertData.essentials;
  const timestamp = dayjs(firedDateTime).format('ddd, D MMM YYYY hh:mm:ss Z');
  const subscriptionId = alertId.split('/')[2];
  const newStatus = monitorCondition.toLowerCase() === 'resolved';
  const peer = whichPeer(condition.allOf[0].dimensions);
  const updatedStatus = JSON.parse(
    await setPeerStatus({ peer, status: newStatus }),
  );
  const peersKeys = Object.keys(updatedStatus);
  const totalPeers = peersKeys.length;
  const peersDown = peersKeys.filter(
    (peerKey) => updatedStatus[peerKey] !== true,
  );
  const title = `Azure ExpressRoute Alert`;
  // AdaptiveCard color strings: good = green, accent = blue, warning = yellow, attention = red, emphasis = gray
  let color = 'accent';
  let description = '';
  if (monitorCondition.toLowerCase() === 'resolved' && !peersDown.length) {
    color = 'good';
    description = `${peer} UP (all peers operating normally)`;
  }
  if (peersDown.length) {
    color = 'warning';
    description = `${peer} ${
      monitorCondition.toLowerCase() === 'resolved' ? 'UP' : 'DOWN'
    } (${peersDown.length} of ${totalPeers} peers down)`;
    if (peersDown.length === totalPeers) {
      color = 'attention';
    }
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
    text: description,
    size: 'Large',
    wrap: true,
  };

  const factSetOne = {
    type: 'FactSet',
    facts: [
      {
        title: 'Affected Peer:',
        value: peer,
      },
      {
        title: 'Alert Rule:',
        value: alertRule,
      },
      {
        title: 'Alert State:',
        value: monitorCondition,
      },
      {
        title: 'Alert Timestamp:',
        value: timestamp,
      },
      {
        title: 'Subscription ID:',
        value: subscriptionId,
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
