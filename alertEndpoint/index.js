const axios = require('axios').default;

const { isExpressRouteAlert } = require('../lib/helpers');

const {
  MS_TEAMS_NOTIFICATION_WEBHOOK_URL,
  MS_TEAMS_ALERT_WEBHOOK_URL,
  MS_TEAMS_DEV_WEBHOOK_URL,
  NODE_ENV,
  LOCAL_DEV,
} = process.env;

module.exports = async (context, req) => {
  try {
    if (req.body) {
      let webHookUrl = MS_TEAMS_NOTIFICATION_WEBHOOK_URL;
      const { schemaId } = req.body;
      let adaptiveCard;
      // supported schema: azureMonitorCommonAlertSchema
      if (
        schemaId === 'azureMonitorCommonAlertSchema' &&
        req.body.data &&
        req.body.data.essentials
      ) {
        const { monitoringService, alertTargetIDs } = req.body.data.essentials;
        if (monitoringService) {
          if (monitoringService === 'ServiceHealth') {
            // context.log.info('SERVICE HEALTH ALERT');
            context.log.info('SERVICE HEALTH ALERT DATA\n', req.body.data);
            webHookUrl = MS_TEAMS_ALERT_WEBHOOK_URL;
            const { messageCard } = require('../lib/cards/serviceHealthAlert');
            adaptiveCard = messageCard(req.body.data);
          }
          if (monitoringService === 'Application Insights') {
            // context.log.info('ACTIVITY LOG MONITOR ALERT');
            // const { messageCard } = require('../lib/cards/activityLogsAlert');
            // adaptiveCard = messageCard(req.body);
          }
          if (monitoringService === 'Platform') {
            // context.log.info('PLATFORM MONITOR ALERT');
            if (isExpressRouteAlert(alertTargetIDs)) {
              try {
                webHookUrl = MS_TEAMS_ALERT_WEBHOOK_URL;
                const {
                  messageCard,
                } = require('../lib/cards/expressRouteAlert');
                adaptiveCard = await messageCard(req.body.data);
              } catch (error) {
                // allow processing to continue while developing new expressroute alerts
                adaptiveCard = null;
                context.log.error('UNRECOGNIZED EXPRESSROUTE DATA:\n', error);
              }
            }
          }
        }
      }
      if (!adaptiveCard) {
        // use dev webhook if available, fall back to notification webhook
        webHookUrl =
          MS_TEAMS_DEV_WEBHOOK_URL || MS_TEAMS_NOTIFICATION_WEBHOOK_URL;
        const { messageCard } = require('../lib/cards/simple');
        const color = 'warning';
        const title = 'Azure Monitoring Alert (unsupported payload)';
        const text = JSON.stringify(req.body);
        adaptiveCard = messageCard({ title, color, text });
      }

      // always use dev webhook if provided and in a development environment
      if (
        (NODE_ENV === 'development' || LOCAL_DEV === 'true') &&
        MS_TEAMS_DEV_WEBHOOK_URL !== undefined
      ) {
        webHookUrl = MS_TEAMS_DEV_WEBHOOK_URL;
      }

      await axios
        .post(webHookUrl, adaptiveCard)
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
        body: JSON.stringify({
          status: 400,
          error: errorMessage,
        }),
      };
      context.done();
    }
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: JSON.stringify({
        status: 500,
        error,
      }),
    };
    context.done();
  }
};
