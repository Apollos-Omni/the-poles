import { searchProductCatalog } from '../../data/products.js';

const PRODUCT_PROVIDER_SLOTS = [
  {
    id: 'ebay_browse',
    label: 'eBay Browse API',
    configured: (env) => Boolean(env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET),
    status: 'placeholder',
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

async function searchConfiguredProductProviders(_input, env) {
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
