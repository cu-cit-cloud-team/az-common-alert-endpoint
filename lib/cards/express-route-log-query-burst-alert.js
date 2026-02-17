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

  const metricLabel = `${metricMeasureColumn}:`;
  const metricText = `${Math.round(Number(metricValue) / 1000000)}mbps (${metricValue})`;
  const showMetric = monitorCondition.toLowerCase() !== 'resolved';

  const tableContent = {
    type: 'Container',
    targetWidth: 'atLeast:Narrow',
    spacing: 'Small',
    height: 'stretch',
    items: [
      {
        type: 'Table',
        columns: [
          {
            horizontalCellContentAlignment: 'Left',
            width: 'auto',
            verticalCellContentAlignment: 'Top',
          },
          {
            horizontalCellContentAlignment: 'Left',
            width: 'auto',
            verticalCellContentAlignment: 'Top',
          },
        ],
        rows: [
          {
            type: 'TableRow',
            spacing: 'None',
            cells: [
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'Alert State:',
                    weight: 'Bolder',
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: monitorCondition,
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
            ],
          },
          ...(showMetric
            ? [
                {
                  type: 'TableRow',
                  spacing: 'None',
                  cells: [
                    {
                      type: 'TableCell',
                      spacing: 'None',
                      items: [
                        {
                          type: 'TextBlock',
                          text: metricLabel,
                          weight: 'Bolder',
                          wrap: true,
                          spacing: 'None',
                        },
                      ],
                    },
                    {
                      type: 'TableCell',
                      spacing: 'None',
                      items: [
                        {
                          type: 'TextBlock',
                          text: metricText,
                          wrap: true,
                          spacing: 'None',
                        },
                      ],
                    },
                  ],
                },
              ]
            : []),
          {
            type: 'TableRow',
            spacing: 'None',
            cells: [
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'Alert Timestamp:',
                    weight: 'Bolder',
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: timestamp,
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
            ],
          },
          {
            type: 'TableRow',
            spacing: 'None',
            cells: [
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
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
                type: 'TableCell',
                spacing: 'None',
                items: [
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
        firstRowAsHeaders: false,
        showGridLines: false,
        verticalCellContentAlignment: 'Top',
        horizontalCellContentAlignment: 'Left',
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
