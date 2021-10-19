exports.messageCard = ({ title, text, color = '808080' }) => ({
  '@type': 'MessageCard',
  '@context': 'https://schema.org/extensions',
  summary: title,
  themeColor: color,
  title,
  text,
});
