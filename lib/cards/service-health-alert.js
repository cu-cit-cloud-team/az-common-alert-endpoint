const TurndownService = require('turndown');

const {
  assembleAdaptiveCard,
  getEmoji,
  localizeDateTime,
} = require('../helpers');

const turndownService = new TurndownService();

exports.messageCard = (alertData) => {
  const { incidentType, stage } = alertData.alertContext.properties;
  const { firedDateTime, alertId } = alertData.essentials;

  const timestamp = localizeDateTime(firedDateTime);
  const subscriptionId = alertId.split('/')[2];

  const title = 'Azure Service Health Alert';

  const incidentTypes = {
    Informational: 'accent',
    ActionRequired: 'warning',
    Incident: 'attention',
    Maintenance: 'warning',
    Security: 'attention',
  };
  // incidentTypes with stages:  Incident, Security
  const incidentTypesWithStages = ['Incident', 'Security'];
  // Active, Planned, InProgress, Canceled, Rescheduled, Resolved, Complete and RCA
  const incidentStages = {
    Active: 'attention',
    Resolved: 'good',
    RCA: 'accent',
  };
  const color = incidentTypesWithStages.includes(incidentType)
    ? incidentStages[stage]
    : incidentTypes[incidentType];

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
    text: alertData.alertContext.properties.title,
    size: 'Large',
    wrap: true,
  };

  const factSetOneContent = {
    type: 'FactSet',
    facts: [
      {
        title: 'Subscription',
        value: subscriptionId,
      },
      {
        title: 'Timestamp',
        value: timestamp,
      },
      {
        title: 'Type',
        value: incidentType,
      },
      {
        title: 'State',
        value: stage,
      },
      {
        title: 'Service',
        value: alertData.alertContext.properties['service'],
      },
      {
        title: 'Region',
        value: alertData.alertContext.properties['region'],
      },
    ],
  };

  const actionSetContent = {
    type: 'ActionSet',
    actions: [
      {
        type: 'Action.ToggleVisibility',
        title: 'Toggle Additional Details',
        style: 'default',
        targetElements: [
          {
            elementId: 'detailsFactSet',
          },
        ],
      },
      {
        type: 'Action.OpenUrl',
        title: 'View Service Issues Page',
        url: 'https://portal.azure.com/#blade/Microsoft_Azure_Health/AzureHealthBrowseBlade/serviceIssues',
        style: 'default',
      },
    ],
  };

  const factSetTwoContent = {
    type: 'FactSet',
    isVisible: false,
    id: 'detailsFactSet',
    facts: [],
  };
  const propertyKeys = Object.keys(alertData.alertContext.properties);
  const ignoreKeys = [
    'defaultLanguageContent', // repeat data
    'defaultLanguageTitle', // repeat data
    'impactedServices', // repeat data
    'impactedServicesTableRows', // repeat data
    'incidentType', // used elsewhere
    'region', // used elsewhere
    'service', // used elsewhere
    'stage', // used elsewhere
    'title', // used elsewhere
  ];
  for (const key of propertyKeys) {
    if (!ignoreKeys.includes(key)) {
      const factContent = alertData.alertContext.properties[key].includes('<')
        ? turndownService.turndown(alertData.alertContext.properties[key])
        : alertData.alertContext.properties[key];
      factSetTwoContent.facts.push({
        title: key,
        value: factContent,
      });
    }
  }

  const cardTemplate = assembleAdaptiveCard([
    headerContent,
    descriptionContent,
    factSetOneContent,
    actionSetContent,
    factSetTwoContent,
  ]);

  return cardTemplate;
};
