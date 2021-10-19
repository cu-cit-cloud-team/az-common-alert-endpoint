const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

const { getHexForColorString } = require('../helpers');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

exports.messageCard = ({
  title = 'Azure Activity Logs Alert',
  color = 'warning',
}) => {
  const timestamp = dayjs().format('ddd, D MMM YYYY hh:mm:ss Z');
  const themeColor = getHexForColorString(color);
  const messageCardTemplate = {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: title,
    themeColor,
    title,
    sections: [],
    potentialAction: [],
  };
  // sections: [
  //   {
  //     activityTitle: `**Workflow Run [#${runNum}](${repoUrl}/actions/runs/${runId})** on [${repoName}](${repoUrl})`,
  //     facts: [
  //       {
  //         name: 'Branch:',
  //         value: `${branch}`,
  //       },
  //       {
  //         name: 'Commit',
  //         value: `${sha.substr(0, 7)}`,
  //       },
  //     ],
  //     activitySubtitle: `by ${commit.data.commit.author.name} [(@${author.login})](${author.html_url}) on ${timestamp}`,
  //   },
  // ],
  // potentialAction: [
  //   {
  //     '@context': 'http://schema.org',
  //     target: [`${repoUrl}/actions/runs/${runId}`],
  //     '@type': 'ViewAction',
  //     name: 'View Workflow Run',
  //   },
  //   {
  //     '@context': 'http://schema.org',
  //     target: [commit.data.html_url],
  //     '@type': 'ViewAction',
  //     name: 'View Commit Changes',
  //   },
  // ],
  return messageCardTemplate;
};
