# Search Providers Setup

The North Pole search UI calls backend function routes for product, prize, and game search. Provider credentials must stay in backend environment variables. Do not add provider secrets with `VITE_` prefixes or expose them to the frontend.

## Current Behavior

- Product and prize search use `demo_catalog` until external product provider adapters are implemented and configured.
- Game search uses `sample_game_catalog` until external game provider adapters are implemented and configured.
- Demo providers remain available as fallback so the app works without external credentials.
- Live payments, retailer ordering, and fulfillment are not enabled by these search providers.

## Product Providers

Optional provider slots are prepared for:

- eBay Browse API: `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`
- Amazon Product Advertising API: `AMAZON_PAAPI_ACCESS_KEY`, `AMAZON_PAAPI_SECRET_KEY`, `AMAZON_ASSOCIATE_TAG`
- Walmart, Best Buy, and Target official catalog or partner APIs
- Affiliate or merchant catalog feeds

The code only detects whether credentials are configured today. The real network adapters still need to be implemented against each provider's official API and terms.

## Game Providers

Optional provider slots are prepared for:

- IGDB: `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`
- RAWG: `RAWG_API_KEY`
- Steam Web API: `STEAM_API_KEY`
- Epic, Xbox, PlayStation, and mobile app store catalog integrations

The code only detects configured credentials today. Real API adapters still need provider-specific implementation.

## No Scraping

Use official APIs, approved partner feeds, or licensed catalogs only. Do not scrape retailer stores, game stores, app stores, or search result pages unless the provider explicitly authorizes that access for this use case.

## Affiliate Disclosure

If search results include affiliate links, show a clear disclosure near links or purchase actions. A typical disclosure is: "We may earn from qualifying purchases." Confirm final wording with the business and legal requirements for the active affiliate programs.

## Adding a Provider Adapter

1. Add credentials to `backend/.env`.
2. Implement the provider call inside `backend/src/lib/searchProviders/products.js` or `backend/src/lib/searchProviders/games.js`.
3. Normalize results to the existing response shape:
   - Products: `id`, `title`, `brand`, `category`, `images`, `offers`, `source`, `source_label`
   - Games: `id`, `title`, `developer`, `description`, `category`, `platform`, `store`, `skillStyle`, `source`, `source_label`
4. Keep timeouts and error handling local to the provider so the route can fall back to demo data.
5. Never return raw credentials, access tokens, or provider secrets to the frontend.
