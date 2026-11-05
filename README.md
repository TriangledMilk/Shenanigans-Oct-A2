# Coin collection

A public, shared coin collection that demonstrates creating and reading coin records with a native HTML form, an Express API on Netlify Functions, and MongoDB Atlas. Anyone who can access the site can read and add entries. There is no login, editing, or abuse protection.

## Prerequisites

- Node.js 22 or newer and npm.
- A MongoDB Atlas cluster, a database user with permission to read and write the intended database, and network access configured to permit connections from your development environment and Netlify Functions.
- A MongoDB connection string that includes the intended database name. See MongoDB's documentation for URL-encoding special characters in credentials.

## Run locally

1. Copy `.env.example` to `.env` (do not overwrite an existing file) and set `MONGODB_URI` to your Atlas connection string. Do not commit or share credentials.
2. Run `npm install` and then `npm run dev`. The dev script runs the latest Netlify CLI through `npx`; the first run may ask to install it. Netlify CLI loads variables from `.env` for local development. Open the local URL printed by the CLI.
3. Enter a coin's details and submit it. The shared collection beneath the form will reload from MongoDB.

## API

Both endpoints use JSON. The `coin_items` collection is chosen explicitly; no additional index is created.

- `GET /api/coin-items` returns the retrieved MongoDB documents as an array, including MongoDB-generated fields.
- `POST /api/coin-items` accepts `name`, `circulation_or_bullion`, `Ag`, `weight_g`, `weight_toz`, `ASW_toz`, `number`, `production_run`, and `description`. `circulation_or_bullion` must be `circulation` or `bullion`; `Ag` must be between 0 and 1; `number` must be a non-negative integer. Required text fields are trimmed and limited to 120 characters for `name` and `production_run`, and 2,000 for `description`. A valid item returns HTTP 201; invalid input returns HTTP 400.

Example request body:

```json
{
  "name": "American Morgan Dollar",
  "circulation_or_bullion": "circulation",
  "Ag": 0.9,
  "weight_g": 26.73,
  "weight_toz": 0.85944,
  "ASW_toz": 0.77344,
  "number": 2,
  "production_run": "1878-1904, 1921",
  "description": "A United States dollar coin minted from 1878 to 1904, and again in 1921."
}
```

## Deploy on Netlify

Push the project to GitHub and connect the repository in the Netlify dashboard. The checked-in `netlify.toml` supplies the publish directory, function directory, and API rewrite; no build command is needed. In Netlify's environment-variable settings, configure `MONGODB_URI` for the relevant deployment contexts with a scope available to Functions, then deploy. A local `.env` file is not deployed. Use a dedicated least-privileged database user, and ensure Atlas network access permits Netlify's function infrastructure. After deployment, add a coin and reload the page to confirm that it persists. Consider appropriate abuse controls before using this public API for anything beyond a demo.

Automated tests are intentionally outside this demo's scope.
