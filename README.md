# ct-az-common-alert-endpoint

Azure Function for an HTTP endpoint to receive Azure Monitor alerts using the Common Alert Schema

| Branch | Status | CI/CD Build Trigger |
| --- | --- | --- |
| `main` | [![az-common-alert-endpoint](https://github.com/CU-CommunityApps/ct-az-common-alert-endpoint/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/CU-CommunityApps/ct-az-common-alert-endpoint/actions/workflows/build-and-deploy.yml) | Pushes to `main` branch |
| | :point_up: passing === built/deployed | |

## About

:construction: Work and documentation in progress

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

#### Posting Test Data Using `curl`

Assumes functions are running locally using instructions above and you are in the root of the repo directory in your terminal

```bash
curl -X POST -H "Content-Type: application/json" --data "@sample-data/service-health-alert.json" http://localhost:7071/api/alertEndpoint
```
