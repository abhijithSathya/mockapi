# Forecasting Workforce Mock API

Mock REST API server for `docs/forecasting-app-backend-api-design-v4.md`.

This is intentionally separate from `mock-mcp/`. It exposes normal HTTP JSON endpoints for the future Forecasting backend API contracts. Backend responses contain IDs, codes, source labels, numeric values, arrays, timestamps, status codes, and version tokens only. The Agentic App workflows should generate observations, summaries, proposal wording, movement wording, confirmations, and widget configs.

## Local Run

```bash
cd mock-api
npm install
npm start
```

Default local URL: `http://localhost:8788`

## Endpoints

- `GET /health`
- `GET /mock/state`
- `POST /mock/reset`
- `POST /forecasting/workforce/recommendation-candidates`
- `POST /forecasting/workforce/metric-values`
- `POST /forecasting/workforce/hire-options`
- `POST /forecasting/workforce/hire-simulations`
- `POST /forecasting/workforce/hire-proposals`
- `POST /forecasting/workforce/hire-proposals/search`
- `POST /forecasting/workforce/resource-move-options`
- `POST /forecasting/workforce/resource-move-simulations`
- `POST /forecasting/workforce/resource-move-batches`

## Render

Use `mock-api/render.yaml` as the Render blueprint. It sets `rootDir: mock-api`, runs `npm install`, starts with `npm start`, and checks `/health`.
