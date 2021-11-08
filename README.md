# ct-az-common-alert-endpoint

Azure Function for an HTTP endpoint to receive Azure Monitor alerts using the Common Alert Schema

| Branch | Status | CI/CD Build Trigger |
| --- | --- | --- |
| `main` | [![az-common-alert-endpoint](https://github.com/CU-CommunityApps/ct-az-common-alert-endpoint/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/CU-CommunityApps/ct-az-common-alert-endpoint/actions/workflows/build-and-deploy.yml) | Pushes to `main` branch |
| | :point_up: passing === built/deployed | |

**:construction: Work and documentation in progress**

## Azure Function

### `alertEndpoint`

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
    - Examples:
      - Collapsed
      - Full
  - ExpressRoute Platform Alert
    - [Schema](https://docs.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema-definitions#monitoringservice--platform)
    - Examples
      - Primary Down
      - Secondary Down
      - Primary Up
      - Secondary Up

## GitHub Repo Settings

- **Actions secrets:**
  - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE_MAIN`
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
