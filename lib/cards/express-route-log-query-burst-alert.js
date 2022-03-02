const {
  assembleAdaptiveCard,
  localizeDateTime,
  getEmoji,
} = require('../helpers');

exports.messageCard = async (alertData) => {
  console.log(alertData);
  const {
    firedDateTime,
    resolvedDateTime,
    alertId,
    monitorCondition,
    alertTargetIDs,
  } = alertData.data.essentials;
  const {
    // failingPeriods,
    linkToSearchResultsUI,
    metricMeasureColumn,
    metricValue,
    operator,
    // searchQuery,
    threshold,
    timeAggregation,
  } = alertData.data.alertContext.condition.allOf[0];
  const title = 'Azure ExpressRoute Burst Alert';
  const timestamp =
    monitorCondition.toLowerCase() === 'resolved'
      ? localizeDateTime({ date: resolvedDateTime })
      : localizeDateTime({ date: firedDateTime });
  const subscriptionId = alertId.split('/')[2];
  // AdaptiveCard color strings: good = green, accent = blue, warning = yellow, attention = red, emphasis = gray
  let color = 'warning';
  const description = `${timeAggregation} ${metricMeasureColumn} ${operator} ${
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

  const metricFact =
    monitorCondition.toLowerCase() === 'resolved'
      ? { title: '', value: '' }
      : {
          title: `${metricMeasureColumn}:`,
          value: `${Math.round(
            Number(metricValue) / 1000000,
          )}mbps (${metricValue})`,
        };

  const factSetContent = {
    type: 'FactSet',
    facts: [
      metricFact,
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
      // {
      //   title: 'Log Query:',
      //   value: searchQuery,
      // },
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
    factSetContent,
    actionSetContent,
  ]);

  return cardTemplate;
};
