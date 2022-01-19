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
  date instanceof Date
    ? dayjs(date).tz(tz).format(dateFormat)
    : dayjs().tz(tz).format(dateFormat);
