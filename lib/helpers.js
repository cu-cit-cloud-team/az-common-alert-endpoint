const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

/**
 * getAdaptiveCardTemplate
 * @summary returns object with basic structure for an AdaptiveCard
 * @returns {Object}
 */
exports.getAdaptiveCardTemplate = () => ({
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
        body: [],
      },
    },
  ],
});

/**
 * assembleAdaptiveCard
 * @summary asseembles and returns a full AdaptiveCard object
 * @param  {Array} cardSectionsArray
 * @returns {Object}
 */
exports.assembleAdaptiveCard = (cardSectionsArray) => {
  const cardTemplate = exports.getAdaptiveCardTemplate();
  cardTemplate.attachments[0].content.body.push(...cardSectionsArray);
  return cardTemplate;
};

/**
 * localizeDateTime
 * @summary returns a date/time string formatted for specified timezone
 * @param  {(Date|null)} [date=null] returns current date/time if null
 * @param  {string} [tz=America/New_York]
 * @param  {string} [dateFormat=ddd, D MMM YYYY hh:mm:ss Z] (formatting options: https://day.js.org/docs/en/display/format)
 * @returns {string}
 */
exports.localizeDateTime = ({
  date = null,
  tz = 'America/New_York',
  dateFormat = 'ddd, D MMM YYYY hh:mm:ss Z',
}) =>
  date instanceof Date || (typeof date === 'string' && date !== null)
    ? dayjs(date).tz(tz).format(dateFormat)
    : dayjs().tz(tz).format(dateFormat);

/**
 * getEmoji
 * @summary returns an emoji based on adaptive card color
 * @param  {string} [adaptiveCardColor=emphasis]
 * @returns {string}
 */
exports.getEmoji = (adaptiveCardColor = 'emphasis') => {
  const emojiList = {
    good: '✅ ',
    accent: 'ℹ️  ',
    warning: '⚠️  ',
    attention: '🚨 ',
    emphasis: '',
  };
  return emojiList[adaptiveCardColor] || '';
};

/**
 * getColorBasedOnSev
 * @summary returns an adaptive card color based on alert severity
 * @param  {string} sevString azure severity string (e.g. Sev1, Sev2, Sev3, Sev4)
 * @returns {string}
 */
exports.getColorBasedOnSev = (sevString) => {
  const colorList = {
    Sev0: 'attention',
    Sev1: 'attention',
    Sev2: 'warning',
    Sev3: 'accent',
    Sev4: 'accent',
  };
  return colorList[sevString] || '';
};

/**
 * getSevDescription
 * @summary returns the Azure description associated with a sev string
 * @param  {string} sevString azure severity string (e.g. Sev1, Sev2, Sev3, Sev4)
 * @returns {string}
 */
exports.getSevDescription = (sevString) => {
  const colorList = {
    Sev0: 'Critical',
    Sev1: 'Error',
    Sev2: 'Warning',
    Sev3: 'Informational',
    Sev4: 'Verbose',
  };
  return colorList[sevString] || '';
};
