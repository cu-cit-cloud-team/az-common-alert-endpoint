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

  const factSetContent = {
    type: 'FactSet',
    spacing: 'Small',
    facts: [
      {
        title: 'State:',
        value: monitorCondition,
      },
      {
        title: 'Severity:',
        value: severityText,
      },
      {
        title: 'Timestamp:',
        value: timestamp,
      },
      {
        title: 'Subscription:',
        value: subscriptionId,
      },
    ],
    height: 'auto',
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
    factSetContent,
    actionSetContent,
  ]);

  return cardTemplate;
};
