import { app } from '@azure/functions';

import { isExpressRouteAlert } from '../lib/express-route.js';

const {
  MS_TEAMS_NOTIFICATION_WEBHOOK_URL,
  // MS_TEAMS_ALERT_WEBHOOK_URL,
  MS_TEAMS_DEV_WEBHOOK_URL,
  NODE_ENV,
  LOCAL_DEV,
} = process.env;

app.http('alert-endpoint', {
  methods: ['POST'],
  handler: async (request, context) => {
    try {
      if (request.body) {
        const requestBody = await request.json();
        let webHookUrl = MS_TEAMS_NOTIFICATION_WEBHOOK_URL;
        const { schemaId } = requestBody;
        let adaptiveCard;
        // supported schema: azureMonitorCommonAlertSchema
        if (
          schemaId === 'azureMonitorCommonAlertSchema' &&
          requestBody.data &&
          requestBody.data.essentials
        ) {
          const { monitoringService, alertTargetIDs } =
            requestBody.data.essentials;
          if (monitoringService) {
            const { alertContext } = requestBody.data;

            // service health alerts
            if (monitoringService === 'ServiceHealth') {
              // context.info('SERVICE HEALTH ALERT');
              webHookUrl = MS_TEAMS_NOTIFICATION_WEBHOOK_URL;
              const { messageCard } = await import(
                '../lib/cards/service-health-alert.js'
              );
              adaptiveCard = messageCard(requestBody.data);
            }

            // log query alerts
            const logAlertServices = [
              'Log Alerts V2',
              'Log Alerts',
              'Application Insights',
            ];
            if (logAlertServices.includes(monitoringService)) {
              // context.info('LOG QUERY ALERT');
              try {
                // check for expressroute data and use that card if it is
                const burstAlertMetrics = [
                  'BitsOutPerSecond',
                  'BitsInPerSecond',
                ];
                if (
                  burstAlertMetrics.includes(
                    alertContext?.condition?.allOf[0]?.metricMeasureColumn
                  )
                ) {
                  const { messageCard } = await import(
                    '../lib/cards/express-route-log-query-burst-alert.js'
                  );
                  adaptiveCard = await messageCard(requestBody);
                }
                // no custom adaptiveCard in use, default to the log query handler
                if (!adaptiveCard) {
                  const { messageCard } = await import(
                    '../lib/cards/app-insights-log-query-alert.js'
                  );
                  adaptiveCard = await messageCard(requestBody);
                  webHookUrl = MS_TEAMS_DEV_WEBHOOK_URL;
                }
              } catch (error) {
                adaptiveCard = null;
                context.info('⚠️  UNRECOGNIZED LOG QUERY ALERT DATA:\n', error);
              }
            }

            // platform/monitor alerts
            const platformAlertServices = ['Platform'];
            if (platformAlertServices.includes(monitoringService)) {
              // context.info('PLATFORM MONITOR ALERT');
              if (isExpressRouteAlert(alertTargetIDs)) {
                try {
                  const upDownAlertMetrics = ['BgpAvailability'];
                  if (
                    upDownAlertMetrics.includes(
                      alertContext.condition.allOf[0].metricName
                    )
                  ) {
                    const { messageCard } = await import(
                      '../lib/cards/express-route-alert.js'
                    );
                    adaptiveCard = await messageCard(requestBody.data);
                  }
                } catch (error) {
                  adaptiveCard = null;
                  context.info('⚠️  UNRECOGNIZED PLATFORM ALERT DATA:\n', error);
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
          const text = JSON.stringify(requestBody);
          adaptiveCard = messageCard({ title, color, text });
        }

        // always use dev webhook if provided and in a development environment
        if (
          (NODE_ENV === 'development' || LOCAL_DEV === 'true') &&
          MS_TEAMS_DEV_WEBHOOK_URL !== undefined
        ) {
          webHookUrl = MS_TEAMS_DEV_WEBHOOK_URL;
        }

        const response = await fetch(webHookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adaptiveCard),
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          const error = new Error(
            `Fetch error: ${response.status} ${response.statusText}`
          );
          error.status = response.status;
          error.body = errorBody;
          throw error;
        }

        const responseData = await response
          .json()
          .catch(() => response.text());

        return {
          status: 200,
          body: responseData,
        };
      } else {
        const errorMessage = 'ERROR: No POST data received';
        context.error(errorMessage);
        return {
          status: 400,
          body: JSON.stringify({
            status: 400,
            error: errorMessage,
          }),
        };
      }
    } catch (error) {
      context.error(error);
      return {
        status: 500,
        body: JSON.stringify({
          status: 500,
          error,
        }),
      };
    }
  },
});
