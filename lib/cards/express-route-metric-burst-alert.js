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
      ...createDetailItems({
        label: `${metricName}:`,
        value: `${Math.round(Number(metricValue) / 1000000)}mbps (${metricValue})`,
      }),
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
