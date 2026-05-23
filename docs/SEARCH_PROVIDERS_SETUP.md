# Search Providers Setup

The North Pole search UI calls backend function routes for product, prize, and game search. Provider credentials must stay in backend environment variables. Do not add provider secrets with `VITE_` prefixes or expose them to the frontend.

## Current Behavior

- Product and prize search use the eBay Browse API when `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` are configured in the backend environment.
- Game search uses RAWG when `RAWG_API_KEY` is configured in the backend environment.
- Demo providers remain available as fallback so the app works without external credentials.
- If an external provider times out or returns an error, the backend returns fallback demo/sample results with a provider status message instead of failing the search.
- Live payments, retailer ordering, and fulfillment are not enabled by these search providers.

## Product Providers

Optional provider slots are prepared for:

- eBay Browse API: `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`
- Amazon Product Advertising API: `AMAZON_PAAPI_ACCESS_KEY`, `AMAZON_PAAPI_SECRET_KEY`, `AMAZON_ASSOCIATE_TAG`
- Walmart, Best Buy, and Target official catalog or partner APIs
- Affiliate or merchant catalog feeds

### eBay Browse API

1. Create or use an eBay developer account at the official eBay Developers portal.
2. Create an application and obtain production Browse API client credentials.
3. Add these values to `backend/.env` only:
   - `EBAY_CLIENT_ID=`
   - `EBAY_CLIENT_SECRET=`
4. Restart the backend server.

The backend uses OAuth client credentials to request an access token, calls the official Browse `item_summary/search` endpoint, and normalizes item summaries into the existing product/prize result shape. If credentials are absent or the request fails, `demo_catalog` results are returned.

Amazon PA-API, Walmart, Best Buy, Target, and affiliate feed adapters are still future provider work.

## Game Providers

Optional provider slots are prepared for:

- IGDB: `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`
- RAWG: `RAWG_API_KEY`
- Steam Web API: `STEAM_API_KEY`
- Epic, Xbox, PlayStation, and mobile app store catalog integrations

### RAWG

1. Create or use a RAWG account and obtain an API key from RAWG's official API dashboard.
2. Add the value to `backend/.env` only:
   - `RAWG_API_KEY=`
3. Restart the backend server.

The backend calls RAWG's official games search endpoint and normalizes results into the existing game result shape. If the key is absent or the request fails, `sample_game_catalog` results are returned.

IGDB, Steam, Epic, Xbox, PlayStation, and mobile app store adapters are still future provider work.

## No Scraping

Use official APIs, approved partner feeds, or licensed catalogs only. Do not scrape retailer stores, game stores, app stores, or search result pages unless the provider explicitly authorizes that access for this use case.

## Affiliate Disclosure

If search results include affiliate links, show a clear disclosure near links or purchase actions. A typical disclosure is: "We may earn from qualifying purchases." Confirm final wording with the business and legal requirements for the active affiliate programs.

## Adding a Provider Adapter

1. Add credentials to `backend/.env`.
2. Implement the provider call inside `backend/src/lib/searchProviders/products.js` or `backend/src/lib/searchProviders/games.js`.
3. Normalize results to the existing response shape:
   - Products: `id`, `title`, `brand`, `category`, `images`, `offers`, `source`, `source_label`, `product_url`, `price_cents`, `currency`, `availability`
   - Games: `id`, `title`, `developer`, `description`, `category`, `platform`, `store`, `skillStyle`, `source`, `source_label`, `icon_url`, `provider_ids`
4. Keep timeouts and error handling local to the provider so the route can fall back to demo data.
5. Never return raw credentials, access tokens, or provider secrets to the frontend.
