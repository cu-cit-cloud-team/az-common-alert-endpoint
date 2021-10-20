const axios = require('axios').default;

const { MS_TEAMS_WEBHOOK_URL } = process.env;

module.exports = async (context, req) => {
  try {
    if (req.body) {
      const { schemaId } = req.body;
      let adaptiveCard;
      // supported schema: azureMonitorCommonAlertSchema
      if (
        schemaId === 'azureMonitorCommonAlertSchema' &&
        req.body.data &&
        req.body.data.essentials
      ) {
        const { monitoringService } = req.body.data.essentials;
        if (monitoringService) {
          if (monitoringService === 'ServiceHealth') {
            // console.log('SERVICE HEALTH ALERT');
            const { messageCard } = require('../lib/cards/serviceHealthAlert');
            adaptiveCard = messageCard(req.body.data);
          }
          if (monitoringService === 'Application Insights') {
            // console.log('ACTIVITY LOG MONITOR ALERT');
            // const { messageCard } = require('../lib/cards/activityLogsAlert');
            // adaptiveCard = messageCard(req.body);
          }
          if (monitoringService === 'Platform') {
            // console.log('PLATFORM MONITOR ALERT');
            // const { messageCard } = require('../lib/cards/expressRouteAlert');
            // adaptiveCard = messageCard(req.body);
          }
        }
      }
      if (!adaptiveCard) {
        const { messageCard } = require('../lib/cards/simple');
        const color = 'warning';
        const title = 'Azure Monitoring Alert (unsupported payload)';
        const text = JSON.stringify(req.body);
        adaptiveCard = messageCard({ title, color, text });
      }

      await axios
        .post(MS_TEAMS_WEBHOOK_URL, adaptiveCard)
        .then((response) => {
          context.res = {
            status: 200,
            body: response.data,
          };
          context.done();
        })
        .catch((error) => {
          // log error for dev and/or debugging purposes
          context.log.error('AXIOS ERROR:\n', error);
          // bubble error up so it throws 500 and outputs content
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
