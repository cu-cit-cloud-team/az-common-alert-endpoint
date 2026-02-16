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
  } catch (error) {
    // if any of the custom logic fails, continue processing
    // and just use sub id
    subscriptionDisplayName = subscriptionId;
  }

  const tableOneContent = {
    type: 'Container',
    spacing: 'Small',
    items: [
      {
        type: 'Table',
        columns: [
          {
            horizontalCellContentAlignment: 'Left',
            width: 'auto',
            verticalCellContentAlignment: 'Top',
          },
          {
            horizontalCellContentAlignment: 'Left',
            width: 'auto',
            verticalCellContentAlignment: 'Top',
          },
        ],
        rows: [
          {
            type: 'TableRow',
            spacing: 'None',
            cells: [
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'Subscription:',
                    weight: 'Bolder',
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: subscriptionDisplayName,
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
            ],
          },
          {
            type: 'TableRow',
            spacing: 'None',
            cells: [
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'Type:',
                    weight: 'Bolder',
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: `${incidentType} (${stage})`,
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
            ],
          },
          {
            type: 'TableRow',
            spacing: 'None',
            cells: [
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'Fired At:',
                    weight: 'Bolder',
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
              {
                type: 'TableCell',
                spacing: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    text: timestamp,
                    wrap: true,
                    spacing: 'None',
                  },
                ],
              },
            ],
          },
        ],
        firstRowAsHeaders: false,
        showGridLines: false,
        verticalCellContentAlignment: 'Top',
        horizontalCellContentAlignment: 'Left',
      },
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
            elementId: 'detailsColumnSet',
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

  const tableTwoContent = {
    type: 'Container',
    targetWidth: 'atLeast:Narrow',
    spacing: 'Small',
    isVisible: false,
    id: 'detailsColumnSet',
    items: [
      {
        type: 'Table',
        columns: [
          { width: 'auto' },
          { width: 'stretch' },
        ],
        rows: [],
        firstRowAsHeaders: false,
        showGridLines: false,
        verticalCellContentAlignment: 'Top',
        horizontalCellContentAlignment: 'Left',
      },
    ],
  };
  const propertyKeys = Object.keys(alertData.alertContext.properties);
  const ignoreKeys = [
    'defaultLanguageContent', // repeat data
    'defaultLanguageTitle', // repeat data
    // 'impactedServices', // repeat data
    'impactedServicesTableRows', // repeat data
    'incidentType', // used elsewhere
    'region', // used elsewhere
    'service', // used elsewhere
    'stage', // used elsewhere
    'title', // used elsewhere
  ];
  for (const key of propertyKeys) {
    if (!ignoreKeys.includes(key)) {
      const columnContent = alertData.alertContext.properties[key].includes('<')
        ? turndownService.turndown(alertData.alertContext.properties[key])
        : alertData.alertContext.properties[key];
      tableTwoContent.items[0].rows.push({
        type: 'TableRow',
        cells: [
          {
            type: 'TableCell',
            items: [
              {
                type: 'TextBlock',
                text: `${key}:`,
                weight: 'Bolder',
                wrap: true,
              },
            ],
          },
          {
            type: 'TableCell',
            items: [
              {
                type: 'TextBlock',
                text: columnContent,
                wrap: true,
              },
            ],
          },
        ],
      });
    }
  }

  const cardTemplate = assembleAdaptiveCard([
    headerContent,
    tableOneContent,
    actionSetContent,
    tableTwoContent,
  ]);

  return cardTemplate;
};
