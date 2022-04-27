import axios from 'axios';

import { isExpressRouteAlert } from '../lib/express-route.js';

const {
  MS_TEAMS_NOTIFICATION_WEBHOOK_URL,
  // MS_TEAMS_ALERT_WEBHOOK_URL,
  MS_TEAMS_DEV_WEBHOOK_URL,
  NODE_ENV,
  LOCAL_DEV,
} = process.env;

export default async (context, req) => {
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
          const { alertContext } = req.body.data;
          if (monitoringService === 'ServiceHealth') {
            // context.log.info('SERVICE HEALTH ALERT');
            webHookUrl = MS_TEAMS_NOTIFICATION_WEBHOOK_URL;
            const { messageCard } = await import(
              '../lib/cards/service-health-alert.js'
            );
            adaptiveCard = messageCard(req.body.data);
          }
          const logAlertServices = [
            'Log Alerts V2',
            'Log Alerts',
            'Application Insights',
          ];
          if (logAlertServices.includes(monitoringService)) {
            // context.log.info('LOG QUERY ALERT');
            try {
              // check for expressroute data and use that card if it is
              const burstAlertMetrics = ['BitsOutPerSecond', 'BitsInPerSecond'];
              if (
                burstAlertMetrics.includes(
                  alertContext.condition &&
                    alertContext.condition.allOf[0].metricMeasureColumn,
                )
              ) {
                const { messageCard } = await import(
                  '../lib/cards/express-route-log-query-burst-alert.js'
                );
                adaptiveCard = await messageCard(req.body);
              }
              // no custom adaptiveCard in use, default to the generic handler
              if (!adaptiveCard) {
                const { messageCard } = await import(
                  '../lib/cards/app-insights-log-query-alert.js'
                );
                adaptiveCard = await messageCard(req.body);
                webHookUrl = MS_TEAMS_DEV_WEBHOOK_URL;
              }
            } catch (error) {
              adaptiveCard = null;
              context.log.info(
                '⚠️  UNRECOGNIZED LOG QUERY ALERT DATA:\n',
                error,
              );
            }
          }
          const platformAlertServices = ['Platform'];
          if (platformAlertServices.includes(monitoringService)) {
            // context.log.info('PLATFORM MONITOR ALERT');
            if (isExpressRouteAlert(alertTargetIDs)) {
              try {
                const upDownAlertMetrics = ['BgpAvailability'];
                if (
                  upDownAlertMetrics.includes(
                    alertContext.condition.allOf[0].metricName,
                  )
                ) {
                  const { messageCard } = await import(
                    '../lib/cards/express-route-alert.js'
                  );
                  adaptiveCard = await messageCard(req.body.data);
                }
              } catch (error) {
                adaptiveCard = null;
                context.log.info(
                  '⚠️  UNRECOGNIZED PLATFORM ALERT DATA:\n',
                  error,
                );
              }
            }
          }
        }
      }
      // we have unrecognized data or there's been an error
      if (!adaptiveCard) {
        // use dev webhook if available, fall back to notification webhook
        webHookUrl =
          MS_TEAMS_DEV_WEBHOOK_URL || MS_TEAMS_NOTIFICATION_WEBHOOK_URL;
        const { messageCard } = await import('../lib/cards/simple.js');
        const color = 'warning';
        const title = '⚠️  Azure Monitoring Alert (unsupported payload)';
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
          context.log.error('⚠️  AXIOS ERROR:\n', error);
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
