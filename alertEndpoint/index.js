const axios = require('axios').default;

const { getHexForColorString } = require('../lib/helpers');
// const {
//   messageCard: logsAlertCard,
// } = require('../lib/cards/activityLogsAlert');
const {
  messageCard: healthAlertCard,
} = require('../lib/cards/serviceHealthAlert');
const { messageCard: unknownAlertCard } = require('../lib/cards/simple');

const { MS_TEAMS_WEBHOOK_URL } = process.env;

module.exports = async (context, req) => {
  try {
    if (req.body) {
      // supported schemas:
      // - "azureMonitorCommonAlertSchema"
      // - "Microsoft.Insights/activityLogs"
      const { schemaId } = req.body;
      const { monitoringService } = req.body.data.essentials;
      let template;
      if (monitoringService && monitoringService === 'ServiceHealth') {
        console.log('SERVICE HEALTH ALERT');
        template = healthAlertCard(req.body.data);
      }
      if (!template && schemaId === 'Microsoft.Insights/activityLogs') {
        console.log('ACTIVITY LOG MONITOR ALERT');
        // template = logsAlertCard(req.body);
      }
      if (!template) {
        const color = getHexForColorString('warning');
        const title = 'Azure Monitoring Alert (unsupported schema)';
        const text = `\`\`\`${JSON.stringify(req.body)}\`\`\``;
        template = unknownAlertCard({ title, color, text });
      }

      await axios
        .post(MS_TEAMS_WEBHOOK_URL, template)
        .then((response) => {
          context.res = {
            status: 200,
            body: response.data,
          };
          context.done();
        })
        .catch((error) => {
          context.log.error('AXIOS ERROR:\n', error);
          // bubble error up
          throw error;
        });
    } else {
      const errorMessage = 'ERROR: No POST data received';
      context.log.error(errorMessage);
      context.res = {
        status: 400,
        body: errorMessage,
      };
      context.done();
    }
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: error,
    };
    context.done();
  }
};
