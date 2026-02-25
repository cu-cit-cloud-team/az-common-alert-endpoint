import TurndownService from 'turndown';

import {
  assembleAdaptiveCard,
  getEmoji,
  localizeDateTime,
} from '../helpers.js';

const { SUB_DISPLAY_NAME_IN_DESCRIPTION, SUB_DISPLAY_NAME_SEPARATOR } =
  process.env;

const turndownService = new TurndownService();

export const messageCard = (alertData) => {
  const { incidentType, stage } = alertData.alertContext.properties;
  const { firedDateTime, alertId } = alertData.essentials;

  const timestamp = localizeDateTime(firedDateTime);
  const subscriptionId = alertId.split('/')[2];

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
  const title = `${accentEmoji}${alertData.alertContext.properties.title}`;

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
        wrap: true,
        weight: 'Bolder',
        spacing: 'None',
        text: process.env.NODE_ENV === 'development' ? `DEV ${title}` : title,
      },
    ],
  };

  // custom logic checks for existence of env vars and tries
  // to extract sub name from alert description if they exist
  let subscriptionDisplayName = subscriptionId;
  try {
    const { description } = alertData.essentials;
    if (
      SUB_DISPLAY_NAME_IN_DESCRIPTION &&
      SUB_DISPLAY_NAME_SEPARATOR &&
      SUB_DISPLAY_NAME_SEPARATOR.length &&
      description.includes(SUB_DISPLAY_NAME_SEPARATOR)
    ) {
      const textSeparator =
        SUB_DISPLAY_NAME_SEPARATOR?.length &&
        description.includes(SUB_DISPLAY_NAME_SEPARATOR)
          ? SUB_DISPLAY_NAME_SEPARATOR
          : ' for:\n';
      subscriptionDisplayName = description.split(textSeparator)[1]?.length
        ? `${description.split(textSeparator)[1]} (${subscriptionId})`
        : subscriptionId;
    }
  } catch {
    // if any of the custom logic fails, continue processing
    // and just use sub id
    subscriptionDisplayName = subscriptionId;
  }

  const formatPropertyValue = (value) => {
    if (typeof value === 'string') {
      if (!value.trim().length) {
        return '';
      }
      return value.includes('<') ? turndownService.turndown(value) : value;
    }
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const createDetailItems = ({ key, value }) => {
    const label = `${key.charAt(0).toUpperCase()}${key.slice(1)}:`;
    return [
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
                text: formatPropertyValue(value),
                wrap: true,
                spacing: 'None',
                size: 'Default',
              },
            ],
          },
        ],
      },
    ];
  };

  const createSummaryItems = ({ label, value }) => [
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
              weight: 'Bolder',
              wrap: false,
              spacing: 'None',
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
            },
          ],
        },
      ],
    },
  ];

  const tableOneContent = {
    type: 'Container',
    spacing: 'Small',
    items: [
      ...createSummaryItems({
        label: 'Subscription:',
        value: subscriptionDisplayName,
      }),
      ...createSummaryItems({
        label: 'Type:',
        value: `${incidentType} (${stage})`,
      }),
      ...createSummaryItems({ label: 'Fired At:', value: timestamp }),
    ],
  };

  const actionSetContent = {
    type: 'ActionSet',
    targetWidth: 'atLeast:Narrow',
    spacing: 'Small',
    actions: [
      {
        type: 'Action.ToggleVisibility',
        title: 'Toggle Additional Details',
        style: 'default',
        targetElements: [
          {
            elementId: 'detailsItems',
          },
        ],
      },
      {
        type: 'Action.OpenUrl',
        title: 'View Service Issues Page',
        url: `https://portal.azure.com/#blade/Microsoft_Azure_Health/AzureHealthBrowseBlade/serviceIssues/${
          alertData.alertContext.properties.trackingId
        }/${subscriptionId.slice(0, 3)}${subscriptionId.slice(-3)}`,
        style: 'default',
      },
    ],
  };

  const buildDetailsItems = () => {
    const propertyKeys = Object.keys(alertData.alertContext.properties);
    const ignoreKeys = [
      'defaultLanguageContent', // repeat data
      'defaultLanguageTitle', // repeat data
      'impactedServices', // repeat data
      // 'impactedServicesTableRows', // repeat data
      'incidentType', // used elsewhere
      'region', // used elsewhere
      'service', // used elsewhere
      'stage', // used elsewhere
      'title', // used elsewhere
    ];
    const filteredKeys = propertyKeys.filter(
      (key) => !ignoreKeys.includes(key)
    );
    const orderedKeys = [
      ...filteredKeys.filter((key) => key === 'communication'),
      ...filteredKeys.filter((key) => key !== 'communication'),
    ];

    const items = [];
    for (const key of orderedKeys) {
      items.push(
        ...createDetailItems({
          key,
          value: alertData.alertContext.properties[key],
        })
      );
    }
    return items;
  };

  const tableTwoContent = {
    type: 'Container',
    spacing: 'Small',
    isVisible: false,
    id: 'detailsItems',
    items: buildDetailsItems(),
  };

  const cardTemplate = assembleAdaptiveCard([
    headerContent,
    tableOneContent,
    actionSetContent,
    tableTwoContent,
  ]);

  return cardTemplate;
};
