import {
  assembleAdaptiveCard,
  getEmoji,
  localizeDateTime,
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
        text: process.env.NODE_ENV === 'development' ? `DEV ${title}` : title,
      },
    ],
  };

  const accentEmoji = getEmoji(color);
  const descriptionContent = {
    type: 'TextBlock',
    text: `${accentEmoji}${description}`,
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
                text: `${metricName}:`,
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
                text: `${Math.round(
                  Number(metricValue) / 1000000
                )}mbps (${metricValue})`,
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
