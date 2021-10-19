const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

const { getHexForColorString } = require('../helpers');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

exports.messageCard = (alertData) => {
  const title = 'Azure Service Health Alert';
  const { incidentType, stage } = alertData.alertContext.properties;
  const { firedDateTime, alertId } = alertData.essentials;

  const timestamp = dayjs(firedDateTime).format('ddd, D MMM YYYY hh:mm:ss Z');
  const subscriptionId = alertId.split('/')[2];

  const inicidentTypes = {
    Informational: 'info',
    ActionRequired: 'warning',
    Incident: 'failure',
    Maintenance: 'warning',
    Security: 'failure',
  };
  // incidentTypes with stages:  Incident, Security
  const incidentTypesWithStages = ['Incident', 'Security'];
  // Active, Planned, InProgress, Canceled, Rescheduled, Resolved, Complete and RCA
  const incidentStages = {
    Active: 'failure',
    Resolved: 'success',
    RCA: 'info',
  };
  const themeColor = incidentTypesWithStages.includes(incidentType)
    ? getHexForColorString(incidentStages[stage])
    : getHexForColorString(inicidentTypes[stage]);

  const messageCardTemplate = {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: title,
    themeColor,
    title,
    // text: `**Subscription ID:** ${subscriptionId}`,
    sections: [],
    potentialAction: [
      {
        '@context': 'http://schema.org',
        target: [
          'https://portal.azure.com/#blade/Microsoft_Azure_Health/AzureHealthBrowseBlade/serviceIssues',
        ],
        '@type': 'ViewAction',
        name: 'Open Service Issues Page in Azure Portal',
      },
    ],
  };

  const factSections = { facts: [] };
  const propertyKeys = Object.keys(alertData.alertContext.properties);
  const ignoreKeys = [
    'communication', // used elsewhere
    'defaultLanguageContent', // repeat data
    'defaultLanguageTitle', // repeat data
    'impactedServices', // repeat data
    'impactedServicesTableRows', // repeat data
    'region', // used elsewhere
    'service', // used elsewhere
    'stage', // used elsewhere
    'title', // used elsewhere
  ];
  for (const key of propertyKeys) {
    if (!ignoreKeys.includes(key)) {
      factSections.facts.push({
        name: key,
        value: alertData.alertContext.properties[key],
      });
    }
  }

  const sectionOne = {
    startGroup: true,
    activityTitle: `# ${alertData.alertContext.properties.title}`,
    facts: [
      {
        name: 'Subscription',
        value: subscriptionId,
      },
      {
        name: 'Timestamp',
        value: timestamp,
      },
      {
        name: 'Service',
        value: alertData.alertContext.properties['service'],
      },
      {
        name: 'Region',
        value: alertData.alertContext.properties['region'],
      },
      {
        name: 'State',
        value: stage,
      },
      {
        name: 'Details',
        value: alertData.alertContext.properties['communication'],
      },
    ],
  };

  const sectionTwo = {
    startGroup: true,
    activityTitle: '## Additional Details',
    facts: factSections.facts,
  };

  messageCardTemplate.sections.push(sectionOne, sectionTwo);

  return messageCardTemplate;
};
