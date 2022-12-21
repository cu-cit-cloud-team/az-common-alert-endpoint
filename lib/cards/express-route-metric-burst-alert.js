import {
  assembleAdaptiveCard,
  localizeDateTime,
  getEmoji,
} from '../helpers.js';

export const messageCard = async (alertData) => {
  const { firedDateTime, alertId, monitorCondition, alertTargetIDs } =
    alertData.essentials;
  const { metricName, operator, threshold, metricValue } =
    alertData.alertContext.condition.allOf[0];
  const title = 'Azure ExpressRoute Burst Alert';
  const timestamp = localizeDateTime(firedDateTime);
  const subscriptionId = alertId.split('/')[2];
  // AdaptiveCard color strings: good = green, accent = blue, warning = yellow, attention = red, emphasis = gray
  let color = 'warning';
  const description = `${metricName} ${operator} ${
    Number(threshold) / 1000000
  }mbps`;
  if (monitorCondition.toLowerCase() === 'resolved') {
    color = 'good';
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
        text: process.env.NODE_ENV === 'development' ? `DEV ${title}` : title,
      },
    ],
  };

  const accentEmoji = getEmoji(color);
  const descriptionContent = {
    type: 'TextBlock',
    text: `${accentEmoji}${description}`,
    size: 'Large',
    wrap: true,
  };

  const factSetContent = {
    type: 'FactSet',
    facts: [
      {
        title: `${metricName}:`,
        value: `${Math.round(
          Number(metricValue) / 1000000,
        )}mbps (${metricValue})`,
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
        url: `https://portal.azure.com/#resource${alertTargetIDs[0]}/alerts`,
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
