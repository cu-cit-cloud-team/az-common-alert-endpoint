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
  const {
    // failingPeriods,
    linkToSearchResultsUI,
    // metricMeasureColumn,
    // metricValue,
    // operator,
    searchQuery,
    // threshold,
    // timeAggregation,
  } = alertData.data.alertContext.condition.allOf[0];
  // const {
  //   numberOfEvaluationPeriods,
  //   minFailingPeriodsToAlert,
  // } = failingPeriods;

  const title = 'Azure Log Query Alert';
  const timestamp =
    monitorCondition.toLowerCase() === 'resolved'
      ? localizeDateTime({ date: resolvedDateTime })
      : localizeDateTime({ date: firedDateTime });
  const subscriptionId = alertId.split('/')[2];
  // AdaptiveCard color strings: good = green, accent = blue, warning = yellow, attention = red, emphasis = gray
  let color = getColorBasedOnSev(severity);
  if (!color.trim().length) {
    color = 'warning'
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
        text: process.env.NODE_ENV === 'development' ? `${accentEmoji}DEV ${title}` : `${accentEmoji}${title}`,
      },
    ],
  };

  const descriptionContent = {
    type: 'TextBlock',
    text: `${alertRule}${description.length ? ': ' + description : ''}`,
    size: 'Large',
    wrap: true,
  };

  const logQueryContent = {
    type: 'TextBlock',
    text: searchQuery,
    wrap: true,
    fontType: 'Monospace'
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
        url: linkToSearchResultsUI,
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
