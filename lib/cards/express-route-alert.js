const {
  assembleAdaptiveCard,
  localizeDateTime,
  getEmoji,
} = require('../helpers');

const {
  initPeersStatus,
  setPeerStatus,
  whichPeer,
} = require('../express-route');

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
  const title = 'Azure ExpressRoute Alert';
  const timestamp = localizeDateTime(firedDateTime);
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

  const headerContent = {
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
        text: process.env.NODE_ENV === 'development' ? `DEV ${accentEmoji}${title}` : `${accentEmoji}${title}`,
      },
    ],
  };

  const accentEmoji = getEmoji(color);
  const descriptionContent = {
    type: 'TextBlock',
    text: description,
    size: 'Large',
    wrap: true,
  };

  const factSetContent = {
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

  const actionSetContent = {
    type: 'ActionSet',
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'View Alerts in Azure Portal',
        url: `https://portal.azure.com/#@cornellprod.onmicrosoft.com/resource${alertTargetIDs[0]}/alerts`,
      },
    ],
  };

  const cardTemplate = assembleAdaptiveCard([
    headerContent,
    descriptionContent,
    factSetContent,
    actionSetContent,
  ]);

  return cardTemplate;
};
