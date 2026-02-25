import {
  assembleAdaptiveCard,
  getEmoji,
  localizeDateTime,
} from '../helpers.js';

export const messageCard = async (alertData) => {
  const {
    firedDateTime,
    resolvedDateTime,
    alertId,
    monitorCondition,
    alertTargetIDs,
  } = alertData.data.essentials;
  const {
    linkToSearchResultsUI,
    metricMeasureColumn,
    metricName,
    metricValue,
    operator,
    threshold,
    timeAggregation,
  } = alertData.data.alertContext.condition.allOf[0];

  const title = 'Azure ExpressRoute Burst Notification';
  const timestamp =
    monitorCondition.toLowerCase() === 'resolved'
      ? localizeDateTime({ date: resolvedDateTime })
      : localizeDateTime({ date: firedDateTime });

  const subscriptionId = alertId.split('/')[2];

  const description = `${timeAggregation} ${metricMeasureColumn || metricName} ${operator} ${
    Number(threshold) / 1000000
  }mbps`;

  // AdaptiveCard color strings: good = green, accent = blue, warning = yellow, attention = red, emphasis = gray
  let color = 'warning';
  if (monitorCondition.toLowerCase() === 'resolved') {
    color = 'good';
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

  const metricLabel = `${metricMeasureColumn || metricName}:`;
  const metricText = `${Math.round(Number(metricValue) / 1000000)}mbps (${metricValue})`;
  const showMetric = monitorCondition.toLowerCase() !== 'resolved';

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
      ...createDetailItems({ label: 'Alert State:', value: monitorCondition }),
      ...(showMetric
        ? createDetailItems({ label: metricLabel, value: metricText })
        : []),
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
      {
        type: 'Action.OpenUrl',
        title: 'View Log Query Search Results',
        url: linkToSearchResultsUI,
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
