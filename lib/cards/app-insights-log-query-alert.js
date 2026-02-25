import {
  assembleAdaptiveCard,
  getColorBasedOnSev,
  getEmoji,
  getSevDescription,
  localizeDateTime,
} from '../helpers.js';

export const messageCard = async (alertData) => {
  // console.log(alertData);
  const {
    firedDateTime,
    resolvedDateTime,
    alertId,
    monitorCondition,
    alertTargetIDs,
    severity,
    alertRule,
    description,
  } = alertData.data.essentials;

  let queryToDisplay = null;
  let searchResultsLink = null;

  if (alertData.data.alertContext.SearchQuery) {
    queryToDisplay = alertData.data.alertContext.SearchQuery;
    searchResultsLink = alertData.data.alertContext.LinkToSearchResults;
  }
  if (!queryToDisplay && alertData.data.alertContext.condition.allOf) {
    queryToDisplay = alertData.data.alertContext.condition.allOf[0].searchQuery;
    searchResultsLink =
      alertData.data.alertContext.condition.allOf[0].linkToSearchResultsUI;
  }

  const title = 'Azure Log Query Alert';
  const titlePrefix = process.env.NODE_ENV === 'development' ? 'DEV ' : '';
  const descriptionText = description.trim().length
    ? `${alertRule}: ${description}`
    : alertRule;
  const severityText = `${getSevDescription(severity)} (${severity})`;
  const timestamp =
    monitorCondition.toLowerCase() === 'resolved'
      ? localizeDateTime({ date: resolvedDateTime })
      : localizeDateTime({ date: firedDateTime });
  const subscriptionId = alertId.split('/')[2];
  // AdaptiveCard color strings: good = green, accent = blue, warning = yellow, attention = red, emphasis = gray
  let color = getColorBasedOnSev(severity);
  if (!color.trim().length) {
    color = 'warning';
  }
  if (monitorCondition.toLowerCase() === 'resolved') {
    color = 'good';
  }

  const accentEmoji = getEmoji(color);

  const headerContent = {
    type: 'Container',
    style: color,
    bleed: true,
    spacing: 'None',
    items: [
      {
        type: 'TextBlock',
        size: 'Default',
        weight: 'Bolder',
        spacing: 'None',
        text: `${accentEmoji}${titlePrefix}${title}`,
      },
    ],
  };

  const descriptionContent = {
    type: 'TextBlock',
    text: descriptionText,
    size: 'Default',
    weight: 'Bolder',
    spacing: 'Small',
    wrap: true,
  };

  const logQueryContent = {
    type: 'TextBlock',
    text: queryToDisplay,
    wrap: true,
    spacing: 'Small',
    fontType: 'Monospace',
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
              size: 'Medium',
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
    spacing: 'Small',
    items: [
      ...createDetailItems({ label: 'State', value: monitorCondition }),
      ...createDetailItems({ label: 'Severity', value: severityText }),
      ...createDetailItems({ label: 'Timestamp', value: timestamp }),
      ...createDetailItems({ label: 'Subscription', value: subscriptionId }),
    ],
  };

  const actionSetContent = {
    type: 'ActionSet',
    spacing: 'Small',
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'View Log Query Search Results',
        url: searchResultsLink,
      },
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
    logQueryContent,
    tableContent,
    actionSetContent,
  ]);

  return cardTemplate;
};
