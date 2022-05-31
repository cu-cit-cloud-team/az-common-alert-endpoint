import {
  assembleAdaptiveCard,
  localizeDateTime,
  getEmoji,
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

  const description = `${timeAggregation} ${metricMeasureColumn} ${operator} ${
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
    style: color,
    bleed: true,
    spacing: 'None',
    items: [
      {
        type: 'TextBlock',
        size: 'large',
        weight: 'bolder',
        spacing: 'none',
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
      {
        title: 'Alert State:',
        value: monitorCondition,
      },
      metricFact,
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
        url: `https://portal.azure.com/#@cornellprod.onmicrosoft.com/resource${alertTargetIDs[0]}/alerts`,
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
    factSetContent,
    actionSetContent,
  ]);

  return cardTemplate;
};
