const { assembleAdaptiveCard } = require('../helpers');

exports.messageCard = ({ title, text, color = 'emphasis' }) => {
  const titleContent = {
    type: 'Container',
    items: [
      {
        type: 'TextBlock',
        text: title,
        wrap: true,
        size: 'Large',
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
  };

  const cardTemplate = assembleAdaptiveCard([titleContent, bodyContent]);

  return cardTemplate;
};
