/**
 * searchPrizes - Backend endpoint for unified prize search across providers (eBay, etc.)
 * 
 * GET /api/search/prizes?provider=ebay&q=&limit=&offset=&minPrice=&maxPrice=&sort=
 * 
 * Responsibilities:
 * 1. Handle OAuth token caching (eBay client_credentials flow)
 * 2. Call provider APIs (eBay Browse API, etc.)
 * 3. Normalize results to universal PrizeResult format
 * 4. Return paginated, filtered results
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Token cache: { provider: { token, expiresAt } }
const tokenCache = {};

// Helper: Get eBay OAuth access token with caching
async function getEbayAccessToken() {
  const cacheKey = 'ebay';
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (tokenCache[cacheKey] && tokenCache[cacheKey].expiresAt > now + 60000) {
    return tokenCache[cacheKey].token;
  }

  const clientId = Deno.env.get('EBAY_CLIENT_ID');
  const clientSecret = Deno.env.get('EBAY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    // Return a structured "not configured" signal — no crash, no technical error shown to users
    throw Object.assign(new Error('ebay_not_configured'), { userMessage: 'Live eBay search is being connected. Use Demo Prize Search for now.' });
  }

  // eBay OAuth token endpoint
  const tokenUrl = 'https://api.ebay.com/identity/v1/oauth2/token';
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    throw new Error(`eBay OAuth failed: ${tokenResponse.status} ${errorData}`);
  }

  const data = await tokenResponse.json();
  const token = data.access_token;
  const expiresIn = data.expires_in * 1000; // Convert to milliseconds

  // Cache the token
  tokenCache[cacheKey] = {
    token,
    expiresAt: now + expiresIn,
  };

  return token;
}

// Helper: Normalize eBay item to universal PrizeResult format
function normalizeEbayItem(item) {
  const imageUrl = item.image?.imageUrl || '';
  const price = item.price?.value ? parseFloat(item.price.value) * 100 : 0; // Convert to cents

  return {
    provider: 'ebay',
    externalId: item.itemId,
    title: item.title || '',
    imageUrl,
    price, // in cents
    currency: item.price?.currency || 'USD',
    category: item.categoryPath || item.categoryIdPath?.split('>').pop() || 'Uncategorized',
    productUrl: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
    affiliateUrl: null, // eBay affiliate links handled server-side if needed
    condition: item.condition || 'Unknown',
    buyingOptions: item.buyingOptions || [],
    availability: item.estimatedAvailabilities?.[0]?.estimatedAvailabilityStatus || 'UNKNOWN',
    lastCheckedAt: new Date().toISOString(),
  };
}

// Helper: Search eBay
async function searchEbay(token, { q, limit = 20, offset = 0, minPrice, maxPrice, sort = 'RELEVANCE' }) {
  // Use sandbox or production endpoint
  const isProduction = Deno.env.get('EBAY_PRODUCTION') === 'true';
  const baseUrl = isProduction
    ? 'https://api.ebay.com/buy/browse/v1/item_summary/search'
    : 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search';

  // Build query parameters
  const params = new URLSearchParams({
    q: q || 'Nintendo Switch',
    limit: Math.min(limit, 200).toString(),
    offset: offset.toString(),
    sort,
  });

  // Add price filters if provided
  if (minPrice || maxPrice) {
    let priceFilter = '';
    if (minPrice) priceFilter += `price:[${minPrice}..`;
    if (maxPrice) priceFilter += `${maxPrice}]`;
    if (priceFilter) params.append('filter', priceFilter);
  }

  const url = `${baseUrl}?${params}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`eBay Browse API failed: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  return data;
}

// Main handler
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Optional: Require authentication
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider') || 'ebay';
    const q = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sort = url.searchParams.get('sort') || 'RELEVANCE';

    // Route to provider
    if (provider === 'ebay') {
      const token = await getEbayAccessToken();
      const ebayResults = await searchEbay(token, { q, limit, offset, minPrice, maxPrice, sort });

      // Normalize results
      const prizes = (ebayResults.itemSummaries || []).map(normalizeEbayItem);

      return Response.json({
        success: true,
        provider: 'ebay',
        query: q,
        totalResults: ebayResults.total || 0,
        offset,
        limit,
        prizes,
        nextOffset: offset + limit,
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json(
      { error: `Provider "${provider}" not supported. Use "ebay"` },
      { status: 400 }
    );
  } catch (error) {
    console.error('searchPrizes error:', error.message);
    // Return a clean, user-friendly message for known config errors
    const isConfigError = error.message === 'ebay_not_configured';
    return Response.json(
      {
        error: isConfigError
          ? 'Live eBay search is being connected. Use Demo Prize Search for now.'
          : 'Search is temporarily unavailable. Please try again.',
        code: isConfigError ? 'ebay_not_configured' : 'search_error',
      },
      { status: isConfigError ? 503 : 500 }
    );
  }
});