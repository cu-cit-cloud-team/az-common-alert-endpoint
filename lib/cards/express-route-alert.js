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
  const updatedStatus = await setPeerStatus({ peer, status: newStatus });
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

  const createDetailItems = ({ label, value }) => [
    {
      type: 'ColumnSet',
      spacing: 'None',
      columns: [
        {
          type: 'Column',
          width: 'auto',
          items: [
            {
              type: 'TextBlock',
              text: label,
              wrap: false,
              spacing: 'None',
              size: 'Default',
              weight: 'Bolder',
            },
          ],
        },
        {
          type: 'Column',
          width: 'stretch',
          items: [
            {
              type: 'TextBlock',
              text: value,
              wrap: true,
              spacing: 'None',
              size: 'Default',
            },
          ],
        },
      ],
    },
  ];

  const tableContent = {
    type: 'Container',
    targetWidth: 'atLeast:Narrow',
    spacing: 'Small',
    items: [
      ...createDetailItems({ label: 'Affected Peer:', value: peer }),
      ...createDetailItems({ label: 'Alert Rule:', value: alertRule }),
      ...createDetailItems({ label: 'Alert State:', value: monitorCondition }),
      ...createDetailItems({ label: 'Alert Timestamp:', value: timestamp }),
      ...createDetailItems({
        label: 'Subscription ID:',
        value: subscriptionId,
      }),
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
    tableContent,
    actionSetContent,
  ]);

  return cardTemplate;
};
