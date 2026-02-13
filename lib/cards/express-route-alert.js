import { initPeersStatus, setPeerStatus, whichPeer } from '../express-route.js';
import {
  assembleAdaptiveCard,
  getEmoji,
  localizeDateTime,
} from '../helpers.js';

export const messageCard = async (alertData) => {
  await initPeersStatus();
  const { condition } = alertData.alertContext;
  const {
    firedDateTime,
    alertId,
    monitorCondition,
    alertTargetIDs,
    alertRule,
  } = alertData.essentials;

  const title = 'Azure ExpressRoute Alert';
  const timestamp = localizeDateTime(firedDateTime);
  const subscriptionId = alertId.split('/')[2];

  const newStatus = monitorCondition.toLowerCase() === 'resolved';
  const peer = whichPeer(condition.allOf[0].dimensions);
  const updatedStatus = JSON.parse(
    await setPeerStatus({ peer, status: newStatus })
  );
  const peersKeys = Object.keys(updatedStatus);
  const totalPeers = peersKeys.length;
  const peersDown = peersKeys.filter(
    (peerKey) => updatedStatus[peerKey] !== true
  );

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

  const accentEmoji = getEmoji(color);

  const headerContent = {
    type: 'Container',
    targetWidth: 'atLeast:Narrow',
    style: color,
    bleed: true,
    spacing: 'None',
    items: [
      {
        type: 'TextBlock',
        size: 'Default',
        weight: 'Bolder',
        spacing: 'None',
        text:
          process.env.NODE_ENV === 'development'
            ? `DEV ${accentEmoji}${title}`
            : `${accentEmoji}${title}`,
      },
    ],
  };

  const descriptionContent = {
    type: 'TextBlock',
    text: description,
    size: 'Default',
    weight: 'Bolder',
    spacing: 'Small',
    wrap: true,
  };

  const columnSetContent = {
    type: 'Container',
    targetWidth: 'atLeast:Narrow',
    spacing: 'Small',
    height: 'stretch',
    items: [
      {
        type: 'ColumnSet',
        spacing: 'None',
        columns: [
          {
            type: 'Column',
            width: 'auto',
            verticalContentAlignment: 'Top',
            items: [
              {
                type: 'TextBlock',
                text: 'Affected Peer:',
                weight: 'Bolder',
                wrap: true,
                spacing: 'None',
              },
              {
                type: 'TextBlock',
                text: 'Alert Rule:',
                weight: 'Bolder',
                wrap: true,
                spacing: 'None',
              },
              {
                type: 'TextBlock',
                text: 'Alert State:',
                weight: 'Bolder',
                wrap: true,
                spacing: 'None',
              },
              {
                type: 'TextBlock',
                text: 'Alert Timestamp:',
                weight: 'Bolder',
                wrap: true,
                spacing: 'None',
              },
              {
                type: 'TextBlock',
                text: 'Subscription ID:',
                weight: 'Bolder',
                wrap: true,
                spacing: 'None',
              },
            ],
          },
          {
            type: 'Column',
            width: 'stretch',
            verticalContentAlignment: 'Top',
            items: [
              {
                type: 'TextBlock',
                text: peer,
                wrap: true,
                spacing: 'None',
              },
              {
                type: 'TextBlock',
                text: alertRule,
                wrap: true,
                spacing: 'None',
              },
              {
                type: 'TextBlock',
                text: monitorCondition,
                wrap: true,
                spacing: 'None',
              },
              {
                type: 'TextBlock',
                text: timestamp,
                wrap: true,
                spacing: 'None',
              },
              {
                type: 'TextBlock',
                text: subscriptionId,
                wrap: true,
                spacing: 'None',
              },
            ],
          },
        ],
      },
    ],
  };

  const actionSetContent = {
    type: 'ActionSet',
    targetWidth: 'atLeast:Narrow',
    spacing: 'Small',
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'View Alerts in Azure Portal',
        url: `https://portal.azure.com/#resource${alertTargetIDs[0]}/alerts`,
      },
    ],
  };

  const cardTemplate = assembleAdaptiveCard([
    headerContent,
    descriptionContent,
    columnSetContent,
    actionSetContent,
  ]);

  return cardTemplate;
};
