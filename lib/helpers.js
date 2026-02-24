import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import dotenv from 'dotenv';

dotenv.config();

let { NOTIFICATION_TIMEZONE } = process.env;
if (!NOTIFICATION_TIMEZONE) {
  NOTIFICATION_TIMEZONE = 'America/New_York';
}

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(NOTIFICATION_TIMEZONE);

/**
 * getAdaptiveCardTemplate
 * @summary returns object with basic structure for an AdaptiveCard
 * @returns {Object}
 */
export const getAdaptiveCardTemplate = () => ({
  type: 'message',
  attachments: [
    {
      contentType: 'application/vnd.microsoft.card.adaptive',
      contentUrl: null,
      content: {
        msteams: {
          width: 'Full',
        },
        $schema: 'https://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.5',
        body: [],
      },
    },
  ],
});

/**
 * assembleAdaptiveCard
 * @summary assembles and returns a full AdaptiveCard object
 * @param  {Array} cardSectionsArray
 * @returns {Object}
 */
export const assembleAdaptiveCard = (cardSectionsArray) => {
  const cardTemplate = getAdaptiveCardTemplate();
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
export const localizeDateTime = ({
  date = null,
  tz = 'America/New_York',
  dateFormat = 'ddd, D MMM YYYY hh:mm:ss Z',
}) =>
  date instanceof Date || typeof date === 'string'
    ? dayjs(date).tz(tz).format(dateFormat)
    : dayjs().tz(tz).format(dateFormat);

/**
 * getEmoji
 * @summary returns an emoji based on adaptive card color
 * @param  {string} [adaptiveCardColor=emphasis]
 * @returns {string}
 */
export const getEmoji = (adaptiveCardColor = 'emphasis') => {
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
export const getColorBasedOnSev = (sevString) => {
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
export const getSevDescription = (sevString) => {
  const colorList = {
    Sev0: 'Critical',
    Sev1: 'Error',
    Sev2: 'Warning',
    Sev3: 'Informational',
    Sev4: 'Verbose',
  };
  return colorList[sevString] || '';
};
