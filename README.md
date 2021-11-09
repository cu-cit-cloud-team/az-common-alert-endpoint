# ct-az-common-alert-endpoint

Azure Function for an HTTP endpoint to receive Azure Monitor alerts that use the Common Alert Schema

| Branch | Status | CI/CD Build Trigger |
| --- | --- | --- |
| `main` | [![Build & Deploy](https://github.com/CU-CommunityApps/ct-az-common-alert-endpoint/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/CU-CommunityApps/ct-az-common-alert-endpoint/actions/workflows/build-and-deploy.yml) | Pushes to `main` branch |

## :construction: Work and documentation in progress

## Azure Function

### `alertEndpoint`

Accepts alert data from Azure Monitors using the Common Alert Schema - formats alert data
as an [AdaptiveCard](https://adaptivecards.io/explorer/) and then sends it to an
[MS Teams Incoming Webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)

- Type: HTTP Trigger
- Auth: Anonymous
- Accepts:
  - Method: `POST`
  - Content-Type: `application/json`
  - Schema: `azureMonitorCommonAlertSchema`
    - [Definitions](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema-definitions)
    - [About](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema)
- Currently Supported Alerts
  - Azure Service Health Alert
    - [Schema](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema-definitions#monitoringservice--servicehealth)
    - Details:
      - Gives most important info at a glance
      - Color bar changes based on incident type/stage
      - Buttons to toggle additional details or go to service issues page in Azure Portal
      - HTML in communication converted to Markdown so it displays properly
    - Examples:
      - Collapsed
        ![service-health-alert.png](./readme-images/service-health-alert.png)
      - Full
        ![service-health-alert-expanded.png](./readme-images/service-health-alert-expanded.png)
  - ExpressRoute Platform Alert
    - [Schema](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema-definitions#monitoringservice--platform)
    - Details:
      - Gives most important info at a glance
      - Color bar changes based on alert type and number of peers affected
      - Button to go view the alert in the Azure Portal
    - Examples
      - Primary Down
        ![express-route-alert-one.png](./readme-images/express-route-alert-one.png)
      - Secondary Down
        ![express-route-alert-two.png](./readme-images/express-route-alert-two.png)
      - Primary Up
        ![express-route-resolved-one.png](./readme-images/express-route-resolved-one.png)
      - Secondary Up
        ![express-route-resolved-two.png](./readme-images/express-route-resolved-two.png)
  - Application Insights Log Alert
    - [Schema](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema-definitions#monitoringservice--application-insights)
    - Details
      - :construction: WIP
    - Examples
      - :construction: WIP

## GitHub Repo Settings

- **Actions secrets:**
  - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
    - Publish profile for function app
  - `MS_TEAMS_WEBHOOK_URL`
    - URL of MS Teams Incoming Webhook to be used for deployment notifications
  - `ACTIONS_STEP_DEBUG`
    - `false` (set to `true` for additional debug output in GitHub Actions logs)
  - `ACTIONS_RUNNER_DEBUG`
    - `false` (set to `true` for additional debug output in GitHub Actions logs)

## Local Development

### Requirements

- Node.js = v14.x
- npm >= v6.x

### Getting Started

1. Clone repo `git clone https://github.com/CU-CommunityApps/ct-az-common-alert-endpoint.git`
1. Enter directory `cd ct-az-common-alert-endpoint`
1. Install dependencies `npm install`
1. Set up environment variables for `MS_TEAMS_WEBHOOK_URL` in `.env` and `local.settings.json`:
1. Run locally `npm run functions` (for verbose logging use `npm run functions:verbose`)

#### Posting Sample Data Using `curl`

Assumes functions are running locally using instructions above and you are in the root of the repo directory in your terminal

```bash
curl -X POST -H "Content-Type: application/json" --data "@sample-data/service-health-alert.json" http://localhost:7071/api/alertEndpoint
```
