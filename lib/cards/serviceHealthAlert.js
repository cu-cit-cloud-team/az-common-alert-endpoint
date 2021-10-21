const TurndownService = require('turndown');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

const turndownService = new TurndownService();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

exports.messageCard = (alertData) => {
  const { incidentType, stage } = alertData.alertContext.properties;
  const { firedDateTime, alertId } = alertData.essentials;

  const timestamp = dayjs(firedDateTime).format('ddd, D MMM YYYY hh:mm:ss Z');
  const subscriptionId = alertId.split('/')[2];

  const inicidentTypes = {
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
    : inicidentTypes[incidentType];

  const adaptiveCardTemplate = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          msteams: {
            width: 'Full',
          },
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.3',
          body: [
            {
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
                  text: 'Azure Service Health Alert',
                },
              ],
            },
          ],
        },
      },
    ],
  };

  const sectionOne = {
    type: 'TextBlock',
    text: alertData.alertContext.properties.title,
    size: 'Large',
    wrap: true,
  };

  const factSetOne = {
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

  const actionSet = {
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

  const factSetTwo = {
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
      factSetTwo.facts.push({
        title: key,
        value: factContent,
      });
    }
  }

  adaptiveCardTemplate.attachments[0].content.body.push(
    sectionOne,
    factSetOne,
    actionSet,
    factSetTwo,
  );

  return adaptiveCardTemplate;
};
