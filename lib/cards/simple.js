import { assembleAdaptiveCard } from '../helpers.js';

export const messageCard = ({ title, text, color = 'emphasis' }) => {
  const titleContent = {
    type: 'Container',
    targetWidth: 'atLeast:Narrow',
    spacing: 'None',
    items: [
      {
        type: 'TextBlock',
        text: title,
        wrap: true,
        size: 'Default',
        spacing: 'None',
        weight: 'Bolder',
      },
    ],
    style: color,
    bleed: true,
  };
  const bodyContent = {
    type: 'TextBlock',
    text,
    fontType: 'Monospace',
    wrap: true,
    height: 'stretch',
    spacing: 'Small',
  };

  const cardTemplate = assembleAdaptiveCard([titleContent, bodyContent]);

  return cardTemplate;
};
