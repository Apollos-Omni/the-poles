import { searchProductCatalog } from '../../data/products.js';

const EXTERNAL_SEARCH_TIMEOUT_MS = 7000;
const EBAY_MARKETPLACE_ID = 'EBAY_US';
const EBAY_OAUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const EBAY_SEARCH_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';
let ebayTokenCache = null;

const PRODUCT_PROVIDER_SLOTS = [
  {
    id: 'ebay_browse',
    label: 'eBay Browse API',
    configured: (env) => Boolean(env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET),
    status: 'live',
  },
  {
    id: 'amazon_paapi',
    label: 'Amazon Product Advertising API',
    configured: (env) => Boolean(
      env.AMAZON_PAAPI_ACCESS_KEY &&
      env.AMAZON_PAAPI_SECRET_KEY &&
      env.AMAZON_ASSOCIATE_TAG
    ),
    status: 'placeholder',
  },
  {
    id: 'walmart',
    label: 'Walmart catalog API',
    configured: () => false,
    status: 'placeholder',
  },
  {
    id: 'best_buy',
    label: 'Best Buy catalog API',
    configured: () => false,
    status: 'placeholder',
  },
  {
    id: 'target',
    label: 'Target partner catalog',
    configured: () => false,
    status: 'placeholder',
  },
  {
    id: 'affiliate_catalog_feed',
    label: 'Affiliate/catalog feed',
    configured: (env) => Boolean(env.AFFILIATE_CATALOG_FEED_URL),
    status: 'placeholder',
  },
];

const DEMO_PROVIDER = {
  id: 'demo_catalog',
  label: 'Demo product catalog',
};

function boundedLimit(value, fallback = 24) {
  return Math.min(Math.max(Number(value) || fallback, 1), 50);
}

function toCents(value) {
  const number = Number.parseFloat(String(value || ''));
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

function externalAbortSignal(timeoutMs = EXTERNAL_SEARCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

function ebayHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'X-EBAY-C-MARKETPLACE-ID': EBAY_MARKETPLACE_ID,
  };
}

function ebayAspect(item, name) {
  const aspect = item.localizedAspects?.find((entry) => entry.name?.toLowerCase() === name.toLowerCase());
  return aspect?.value || '';
}

async function getEbayAccessToken(env) {
  if (ebayTokenCache?.token && ebayTokenCache.expiresAt > Date.now() + 60000) {
    return ebayTokenCache.token;
  }

  const auth = Buffer.from(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'https://api.ebay.com/oauth/api_scope',
  });
  const { signal, clear } = externalAbortSignal();
  try {
    const response = await fetch(EBAY_OAUTH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
      signal,
    });
    if (!response.ok) {
      throw new Error(`eBay OAuth failed with HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!data.access_token) throw new Error('eBay OAuth response did not include an access token');
    ebayTokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (Number(data.expires_in || 7200) * 1000),
    };
    return ebayTokenCache.token;
  } finally {
    clear();
  }
}

function normalizeEbayItem(item) {
  const price = item.price || {};
  const priceCents = toCents(price.value);
  const category = item.categories?.[0]?.categoryName || 'Prize';
  const brand = ebayAspect(item, 'Brand') || item.seller?.username || 'eBay';
  const imageUrl = item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || '';
  const availability = item.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity === 0 ? 'out_of_stock' : 'in_stock';
  const productUrl = item.itemWebUrl || null;

  return withProductSource({
    id: item.itemId || item.legacyItemId || `ebay-${hashFallback(item.title, productUrl)}`,
    title: item.title || 'eBay item',
    brand,
    category,
    images: imageUrl ? [imageUrl] : [],
    offers: [{
      retailer: 'eBay',
      price_cents: priceCents,
      currency: price.currency || 'USD',
      availability,
      product_url: productUrl,
      source: 'ebay_browse',
      source_label: 'eBay Browse API',
    }],
    source: 'ebay_browse',
    source_label: 'eBay Browse API',
    product_url: productUrl,
    price_cents: priceCents,
    currency: price.currency || 'USD',
    availability,
    provider_ids: {
      ebay_item_id: item.itemId || item.legacyItemId || null,
    },
  }, { id: 'ebay_browse', label: 'eBay Browse API' });
}

function hashFallback(...parts) {
  return parts.filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || Date.now().toString(36);
}

function activeProductProviders(env) {
  return PRODUCT_PROVIDER_SLOTS
    .filter((provider) => provider.configured(env))
    .map((provider) => ({
      id: provider.id,
      label: provider.label,
      status: provider.status,
    }));
}

function withProductSource(product, provider = DEMO_PROVIDER) {
  const source = product.source || provider.id;
  const sourceLabel = product.source_label || product.sourceLabel || provider.label;
  const offers = Array.isArray(product.offers) ? product.offers : [];

  return {
    ...product,
    provider: source,
    source,
    source_label: sourceLabel,
    sourceLabel,
    offers: offers.map((offer) => ({
      ...offer,
      provider: offer.provider || source,
      source: offer.source || source,
      source_label: offer.source_label || offer.sourceLabel || sourceLabel,
    })),
  };
}

function searchDemoCatalog(input) {
  const { products, totalResults } = searchProductCatalog(input);
  return {
    products: products.map((product) => withProductSource(product, DEMO_PROVIDER)),
    totalResults,
    provider: DEMO_PROVIDER.id,
    sourceLabel: DEMO_PROVIDER.label,
    providerStatus: 'fallback',
  };
}

async function searchEbayBrowse(input, env) {
  const q = String(input.q || input.query || '').trim();
  if (!q) {
    return {
      products: [],
      totalResults: 0,
      provider: 'ebay_browse',
      sourceLabel: 'eBay Browse API',
      providerStatus: 'empty_query',
      activeProviders: activeProductProviders(env),
    };
  }

  const token = await getEbayAccessToken(env);
  const limit = boundedLimit(input.limit, 24);
  const offset = Math.max(Number(input.offset) || 0, 0);
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    offset: String(offset),
  });
  const { signal, clear } = externalAbortSignal();
  try {
    const response = await fetch(`${EBAY_SEARCH_URL}?${params.toString()}`, {
      method: 'GET',
      headers: ebayHeaders(token),
      signal,
    });
    if (!response.ok) {
      throw new Error(`eBay Browse search failed with HTTP ${response.status}`);
    }
    const data = await response.json();
    const products = Array.isArray(data.itemSummaries)
      ? data.itemSummaries.map(normalizeEbayItem)
      : [];
    return {
      products,
      totalResults: Number(data.total || products.length) || products.length,
      provider: 'ebay_browse',
      sourceLabel: 'eBay Browse API',
      providerStatus: 'live',
      activeProviders: activeProductProviders(env),
    };
  } finally {
    clear();
  }
}

async function searchConfiguredProductProviders(input, env) {
  const configured = activeProductProviders(env);

  if (!configured.length) {
    return {
      products: [],
      totalResults: 0,
      provider: null,
      sourceLabel: null,
      providerStatus: 'not_configured',
      activeProviders: [],
    };
  }

  if (configured.some((provider) => provider.id === 'ebay_browse')) {
    try {
      return await searchEbayBrowse(input, env);
    } catch (error) {
      return {
        products: [],
        totalResults: 0,
        provider: 'ebay_browse',
        sourceLabel: 'eBay Browse API',
        providerStatus: 'provider_error',
        providerMessage: error.name === 'AbortError' ? 'eBay Browse API request timed out; showing demo catalog fallback.' : 'eBay Browse API request failed; showing demo catalog fallback.',
        activeProviders: configured,
      };
    }
  }

  return {
    products: [],
    totalResults: 0,
    provider: configured[0].id,
    sourceLabel: configured[0].label,
    providerStatus: 'configured_placeholder',
    activeProviders: configured,
  };
}

export async function searchProductsAcrossProviders(input = {}, env = process.env) {
  const configured = await searchConfiguredProductProviders(input, env);
  if (configured.products.length) {
    return {
      ...configured,
      fallbackProvider: DEMO_PROVIDER.id,
      futureProviders: PRODUCT_PROVIDER_SLOTS.map((provider) => provider.id),
    };
  }

  const demo = searchDemoCatalog(input);
  return {
    ...demo,
    activeProviders: configured.activeProviders || [],
    externalProviderStatus: configured.providerStatus,
    providerMessage: configured.providerMessage || null,
    fallbackProvider: DEMO_PROVIDER.id,
    futureProviders: PRODUCT_PROVIDER_SLOTS.map((provider) => provider.id),
  };
}

export async function searchPrizesAcrossProviders(input = {}, env = process.env) {
  const result = await searchProductsAcrossProviders(input, env);
  const prizes = result.products.map((product) => {
    const offer = Array.isArray(product.offers) ? product.offers[0] : null;
    return {
      externalId: product.id,
      title: product.title,
      price: offer?.price_cents || product.price_cents || 0,
      price_cents: offer?.price_cents || product.price_cents || 0,
      imageUrl: product.images?.[0] || product.image_url || '',
      image_url: product.images?.[0] || product.image_url || '',
      category: product.category || 'Prize',
      condition: product.condition || 'New',
      availability: offer?.availability === 'in_stock' ? 'AVAILABLE' : 'OUT_OF_STOCK',
      productUrl: offer?.product_url || product.product_url || null,
      retailer: offer?.retailer || product.retailer || result.sourceLabel,
      provider: product.provider || result.provider,
      source: product.source || result.provider,
      source_label: product.source_label || result.sourceLabel,
      sourceLabel: product.sourceLabel || result.sourceLabel,
    };
  });

  return {
    ...result,
    prizes,
    products: undefined,
  };
}
