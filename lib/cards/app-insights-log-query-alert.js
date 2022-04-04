const {
  assembleAdaptiveCard,
  localizeDateTime,
  getEmoji,
  getColorBasedOnSev,
} = require('../helpers');

exports.messageCard = async (alertData) => {
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
        size: 'large',
        weight: 'bolder',
        spacing: 'none',
        text: `${accentEmoji}${titlePrefix}${title}`,
      },
    ],
  };

  const descriptionContent = {
    type: 'TextBlock',
    text: descriptionText,
    size: 'Large',
    wrap: true,
  };

  const logQueryContent = {
    type: 'TextBlock',
    text: queryToDisplay,
    wrap: true,
    fontType: 'Monospace',
  };

  const factSetContent = {
    type: 'FactSet',
    facts: [
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
        title: 'View Log Query Search Results',
        url: searchResultsLink,
      },
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
    logQueryContent,
    factSetContent,
    actionSetContent,
  ]);

  return cardTemplate;
};
