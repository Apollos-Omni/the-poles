const img = (id) => `https://images.unsplash.com/${id}?w=500&h=500&fit=crop&auto=format`;

export const products = [
  {
    id: 'prod-switch-oled', title: 'Nintendo Switch OLED Model', brand: 'Nintendo', category: 'Gaming',
    images: [img('photo-1612036782180-6f0b6cd84627')], keywords: ['switch', 'console', 'gaming', 'nintendo'],
    offers: [{ retailer: 'Demo Retailer', price_cents: 34999, availability: 'in_stock', product_url: 'https://www.nintendo.com/' }],
  },
  {
    id: 'prod-ps5-controller', title: 'Wireless Game Controller', brand: 'Sony', category: 'Gaming',
    images: [img('photo-1606813907291-d86efa9b94db')], keywords: ['ps5', 'playstation', 'controller', 'gaming'],
    offers: [{ retailer: 'Demo Retailer', price_cents: 7499, availability: 'in_stock', product_url: 'https://www.playstation.com/' }],
  },
  {
    id: 'prod-airpods-pro', title: 'Apple AirPods Pro 2nd Generation', brand: 'Apple', category: 'Electronics',
    images: [img('photo-1606220945770-b5b6c2c55bf1')], keywords: ['airpods', 'earbuds', 'headphones', 'apple'],
    offers: [{ retailer: 'Demo Retailer', price_cents: 24900, availability: 'in_stock', product_url: 'https://www.apple.com/airpods/' }],
  },
  {
    id: 'prod-lego-starship', title: 'Collector Starship Building Set', brand: 'LEGO', category: 'Toys',
    images: [img('photo-1585366119957-e25a4b6c7128')], keywords: ['lego', 'starship', 'toy', 'building'],
    offers: [{ retailer: 'Demo Retailer', price_cents: 12999, availability: 'in_stock', product_url: 'https://www.lego.com/' }],
  },
  {
    id: 'prod-instant-pot', title: 'Multi-Use Electric Pressure Cooker', brand: 'Instant Pot', category: 'Home & Kitchen',
    images: [img('photo-1588708215982-f54817a0210f')], keywords: ['instant pot', 'kitchen', 'cooker'],
    offers: [{ retailer: 'Demo Retailer', price_cents: 9900, availability: 'in_stock', product_url: 'https://www.instanthome.com/' }],
  },
  {
    id: 'prod-basketball', title: 'Official Size Indoor/Outdoor Basketball', brand: 'Spalding', category: 'Sports',
    images: [img('photo-1546519638-68e109498ffc')], keywords: ['basketball', 'sports', 'ball'],
    offers: [{ retailer: 'Demo Retailer', price_cents: 3499, availability: 'in_stock', product_url: 'https://www.spalding.com/' }],
  },
  {
    id: 'prod-skateboard', title: 'Complete Street Skateboard', brand: 'Element', category: 'Sports',
    images: [img('photo-1520045892732-304bc3ac5d8e')], keywords: ['skateboard', 'sports', 'street'],
    offers: [{ retailer: 'Demo Retailer', price_cents: 8999, availability: 'in_stock', product_url: 'https://www.elementbrand.com/' }],
  },
  {
    id: 'prod-gift-card', title: 'Universal Digital Gift Card', brand: 'North Pole', category: 'Gift Card',
    images: [img('photo-1513885535751-8b9238bd345a')], keywords: ['gift card', 'digital', 'prize'],
    offers: [{ retailer: 'The Poles', price_cents: 5000, availability: 'in_stock', product_url: null }],
  },
];

const aliases = {
  ps5: 'playstation controller',
  ps4: 'playstation controller',
  xbox: 'game controller',
  switch: 'nintendo switch',
  airpod: 'airpods',
  'air pods': 'airpods',
};

export function searchProductCatalog({ q = '', category = null, limit = 24, offset = 0, minPrice, maxPrice } = {}) {
  const query = String(q || '').toLowerCase().trim();
  const expanded = aliases[query] || query;
  const terms = expanded.split(/\s+/).filter(Boolean);

  let rows = products.filter((product) => {
    if (category && product.category?.toLowerCase() !== String(category).toLowerCase()) return false;
    const price = product.offers?.[0]?.price_cents || 0;
    if (minPrice && price < Number(minPrice) * 100) return false;
    if (maxPrice && price > Number(maxPrice) * 100) return false;
    if (!terms.length) return true;
    const haystack = [product.title, product.brand, product.category, ...(product.keywords || [])].join(' ').toLowerCase();
    return terms.every((term) => haystack.includes(term)) || haystack.includes(query);
  });

  if (!rows.length && query.length >= 2) {
    rows = products.filter((product) => product.category?.toLowerCase().includes('gift')).slice(0, 1);
  }

  const totalResults = rows.length;
  rows = rows.slice(offset, offset + limit);
  return { products: rows, totalResults };
}
