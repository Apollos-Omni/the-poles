import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Keyword aliases for smarter matching
const ALIASES = {
  "ps5": "playstation 5",
  "ps4": "playstation 4",
  "air pods": "airpods",
  "airpod": "airpods",
  "xbox": "xbox series",
  "switch": "nintendo switch",
  "iphone": "apple iphone",
  "ipad": "apple ipad",
  "beats": "beats headphones",
  "yeezys": "adidas yeezy",
  "jordans": "jordan",
  "forces": "air force"
};

function matchesQuery(product, query) {
  const q = query.toLowerCase().trim();
  const expanded = ALIASES[q] || q;

  const searchable = [
    product.title,
    product.brand,
    product.category,
    ...(product.keywords || [])
  ].filter(Boolean).join(" ").toLowerCase();

  return (
    searchable.includes(q) ||
    searchable.includes(expanded) ||
    expanded.split(" ").every(word => searchable.includes(word)) ||
    q.split(" ").every(word => searchable.includes(word))
  );
}

// --- EXPANDED MOCK DATABASE ---
const MOCK_PRODUCTS = [
  // Electronics
  { retailer: "amazon", source_id: "B08N5WRWNW", title: "Amazon Echo Dot (5th Gen)", brand: "Amazon", category: "Electronics", price_cents: 4999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&h=300&fit=crop"], keywords: ["echo", "alexa", "smart speaker"], gtins: ["840080503520"] },
  { retailer: "bestbuy", source_id: "BB_AIRPODS_PRO_2", title: "Apple AirPods Pro 2nd Gen", brand: "Apple", category: "Electronics", price_cents: 24900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop"], keywords: ["airpods", "air pods", "earbuds", "headphones", "apple", "wireless"], gtins: ["194253397241"] },
  { retailer: "amazon", source_id: "AMZ_SONY_WH", title: "Sony WH-1000XM5 Headphones", brand: "Sony", category: "Electronics", price_cents: 29999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"], keywords: ["headphones", "noise cancelling", "sony", "wireless", "over ear"] },
  { retailer: "bestbuy", source_id: "BB_IPAD_AIR", title: "Apple iPad Air 10.9\"", brand: "Apple", category: "Electronics", price_cents: 59900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1544244015-0df4592c8487?w=300&h=300&fit=crop"], keywords: ["ipad", "tablet", "apple", "ipad air"] },
  { retailer: "amazon", source_id: "AMZ_JBL_FLIP", title: "JBL Flip 6 Portable Speaker", brand: "JBL", category: "Electronics", price_cents: 12999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop"], keywords: ["speaker", "bluetooth", "portable", "jbl", "waterproof"] },
  { retailer: "bestbuy", source_id: "BB_GALAXY_TAB", title: "Samsung Galaxy Tab S9", brand: "Samsung", category: "Electronics", price_cents: 79900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=300&h=300&fit=crop"], keywords: ["tablet", "samsung", "galaxy", "android"] },
  { retailer: "amazon", source_id: "AMZ_MONITOR", title: "Gaming Monitor 27\" 144Hz", brand: "ASUS", category: "Electronics", price_cents: 34999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop"], keywords: ["monitor", "gaming monitor", "144hz", "display", "pc"] },
  { retailer: "bestbuy", source_id: "BB_IPHONE_15", title: "Apple iPhone 15 Pro", brand: "Apple", category: "Electronics", price_cents: 99900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop"], keywords: ["iphone", "iphone 15", "apple", "smartphone", "phone"] },

  // Gaming
  { retailer: "walmart", source_id: "WM_SWITCH_OLED", title: "Nintendo Switch OLED", brand: "Nintendo", category: "Gaming", price_cents: 34900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?w=300&h=300&fit=crop"], keywords: ["switch", "nintendo", "console", "handheld", "gaming"], gtins: ["045496453250"] },
  { retailer: "bestbuy", source_id: "BB_PS5", title: "Sony PlayStation 5 Console", brand: "Sony", category: "Gaming", price_cents: 49999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&h=300&fit=crop"], keywords: ["ps5", "playstation", "playstation 5", "gaming console", "sony"] },
  { retailer: "amazon", source_id: "AMZ_PS5_CTRL", title: "PlayStation 5 DualSense Controller", brand: "Sony", category: "Gaming", price_cents: 6999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1592890288564-76628a30a657?w=300&h=300&fit=crop"], keywords: ["ps5 controller", "dualsense", "playstation", "controller"] },
  { retailer: "amazon", source_id: "AMZ_XBOX_PASS", title: "Xbox Game Pass Ultimate (3 months)", brand: "Microsoft", category: "Gaming", price_cents: 4499, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop"], keywords: ["xbox", "game pass", "microsoft", "subscription", "gaming"] },
  { retailer: "bestbuy", source_id: "BB_RAZER_HS", title: "Razer BlackShark V2 Gaming Headset", brand: "Razer", category: "Gaming", price_cents: 9999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop"], keywords: ["headset", "gaming headset", "razer", "pc gaming"] },
  { retailer: "amazon", source_id: "AMZ_GAMING_CHAIR", title: "Gaming Chair Pro Series", brand: "Secretlab", category: "Gaming", price_cents: 29900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300&h=300&fit=crop"], keywords: ["gaming chair", "chair", "desk chair", "racing chair"] },
  { retailer: "amazon", source_id: "AMZ_STEAM_50", title: "Steam Gift Card $50", brand: "Steam", category: "Gaming", price_cents: 5000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1553481187-be93c21490a9?w=300&h=300&fit=crop"], keywords: ["steam", "gift card", "gaming", "pc games", "valve"] },

  // Sneakers
  { retailer: "target", source_id: "TG_NIKE_AIR_MAX", title: "Nike Air Max 270", brand: "Nike", category: "Sneakers", price_cents: 15000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop"], keywords: ["shoes", "sneakers", "nike", "air max", "running"] },
  { retailer: "amazon", source_id: "AMZ_ADIDAS_UB", title: "Adidas Ultraboost 22 Running Shoes", brand: "Adidas", category: "Sneakers", price_cents: 18000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop"], keywords: ["shoes", "sneakers", "adidas", "ultraboost", "running"] },
  { retailer: "target", source_id: "TG_JORDAN_1", title: "Air Jordan 1 Retro High OG", brand: "Nike", category: "Sneakers", price_cents: 17000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1556906781-9a412961a28c?w=300&h=300&fit=crop"], keywords: ["jordan", "jordans", "air jordan", "nike", "basketball shoes", "retro"] },
  { retailer: "walmart", source_id: "WM_NB990", title: "New Balance 990v5 Sneakers", brand: "New Balance", category: "Sneakers", price_cents: 17500, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=300&fit=crop"], keywords: ["shoes", "sneakers", "new balance", "running"] },
  { retailer: "amazon", source_id: "AMZ_CONVERSE", title: "Converse Chuck Taylor All Star", brand: "Converse", category: "Sneakers", price_cents: 6500, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&h=300&fit=crop"], keywords: ["shoes", "sneakers", "converse", "chuck taylor", "canvas"] },

  // Sports Gear
  { retailer: "amazon", source_id: "AMZ_NBA_BALL", title: "Spalding NBA Official Basketball", brand: "Spalding", category: "Sports", price_cents: 4999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1546519638405-a9f9024ea68f?w=300&h=300&fit=crop"], keywords: ["basketball", "ball", "nba", "sports", "spalding"] },
  { retailer: "walmart", source_id: "WM_SOCCER", title: "Wilson Soccer Ball Match Quality", brand: "Wilson", category: "Sports", price_cents: 3999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=300&h=300&fit=crop"], keywords: ["soccer", "soccer ball", "football", "sports"] },
  { retailer: "amazon", source_id: "AMZ_DUMBBELLS", title: "Bowflex SelectTech Adjustable Dumbbells", brand: "Bowflex", category: "Sports", price_cents: 39900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop"], keywords: ["dumbbells", "weights", "gym", "fitness", "workout"] },
  { retailer: "bestbuy", source_id: "BB_FITBIT", title: "Fitbit Charge 6 Fitness Tracker", brand: "Fitbit", category: "Sports", price_cents: 9900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1576243345690-4e4b79b09b23?w=300&h=300&fit=crop"], keywords: ["fitness tracker", "smartwatch", "fitbit", "health", "wearable"] },

  // Toys
  { retailer: "target", source_id: "TG_LEGO_FALCON", title: "LEGO Star Wars Millennium Falcon", brand: "LEGO", category: "Toys", price_cents: 84999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1585366119957-e25a4b6c7128?w=300&h=300&fit=crop"], keywords: ["lego", "star wars", "millennium falcon", "toys", "building"] },
  { retailer: "walmart", source_id: "WM_LEGO_CREATOR", title: "LEGO Creator 3-in-1 Deep Sea Creatures", brand: "LEGO", category: "Toys", price_cents: 12999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1585366119957-e25a4b6c7128?w=300&h=300&fit=crop"], keywords: ["lego", "creator", "toys", "building"], gtins: ["673419318337"] },
  { retailer: "target", source_id: "TG_RC_TRUCK", title: "Remote Control Monster Truck", brand: "Traxxas", category: "Toys", price_cents: 4999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=300&fit=crop"], keywords: ["remote control", "rc", "truck", "monster truck", "toy car"] },
  { retailer: "walmart", source_id: "WM_HOTWHEELS", title: "Hot Wheels Ultimate Track Set", brand: "Hot Wheels", category: "Toys", price_cents: 3999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=300&h=300&fit=crop"], keywords: ["hot wheels", "toy cars", "track", "kids", "racing"] },
  { retailer: "target", source_id: "TG_MARVEL", title: "Marvel Avengers Action Figure Set", brand: "Hasbro", category: "Toys", price_cents: 2999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1608889175157-1f1e1b98fdc7?w=300&h=300&fit=crop"], keywords: ["marvel", "action figure", "avengers", "superhero", "toys"] },

  // Event Tickets
  { retailer: "ticketmaster", source_id: "TM_NBA_2PACK", title: "NBA Game Tickets (2-pack)", brand: "Ticketmaster", category: "Event Tickets", price_cents: 25000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1546519638405-a9f9024ea68f?w=300&h=300&fit=crop"], keywords: ["tickets", "nba", "basketball", "sports tickets", "event"] },
  { retailer: "stubhub", source_id: "SH_CONCERT", title: "Concert Tickets – General Admission (2x)", brand: "StubHub", category: "Event Tickets", price_cents: 20000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop"], keywords: ["concert", "tickets", "music", "live music", "show"] },
  { retailer: "ticketmaster", source_id: "TM_NFL", title: "NFL Game Day Tickets (2-pack)", brand: "Ticketmaster", category: "Event Tickets", price_cents: 40000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=300&fit=crop"], keywords: ["nfl", "football", "tickets", "sports", "game day"] },
  { retailer: "stubhub", source_id: "SH_FESTIVAL", title: "Music Festival Weekend Pass", brand: "StubHub", category: "Event Tickets", price_cents: 35000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop"], keywords: ["festival", "music festival", "weekend pass", "concert", "tickets"] },

  // Vacations
  { retailer: "airbnb", source_id: "AB_HOTEL_2N", title: "Weekend Hotel Stay (2 nights)", brand: "Airbnb", category: "Vacations", price_cents: 80000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=300&fit=crop"], keywords: ["hotel", "vacation", "travel", "weekend getaway", "stay"] },
  { retailer: "carnival", source_id: "CV_CRUISE_3N", title: "Caribbean Cruise (3 nights, 2 people)", brand: "Carnival", category: "Vacations", price_cents: 150000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1548574505-5e239809ee19?w=300&h=300&fit=crop"], keywords: ["cruise", "caribbean", "vacation", "travel", "cruise ship"] },
  { retailer: "expedia", source_id: "EX_VEGAS", title: "Las Vegas Trip Package (2 nights)", brand: "Expedia", category: "Vacations", price_cents: 120000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=300&h=300&fit=crop"], keywords: ["las vegas", "vegas", "vacation", "travel", "trip"] },
  { retailer: "disney", source_id: "DI_PARK_2DAY", title: "Disneyland 2-Day Park Hopper (2 tickets)", brand: "Disney", category: "Vacations", price_cents: 60000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1565060169861-3572d3d4f0e4?w=300&h=300&fit=crop"], keywords: ["disneyland", "disney", "theme park", "tickets", "vacation", "family"] },

  // Experiences
  { retailer: "ifly", source_id: "IF_SKYDIVE_2", title: "Indoor Skydiving – 2 People", brand: "iFLY", category: "Experiences", price_cents: 15000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=300&h=300&fit=crop"], keywords: ["skydiving", "indoor skydiving", "adventure", "experience", "thrill"] },
  { retailer: "local", source_id: "LO_ESCAPE_8", title: "Private Escape Room – 8 People", brand: "Local Partner", category: "Experiences", price_cents: 20000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1529448005898-adb02a71bc3a?w=300&h=300&fit=crop"], keywords: ["escape room", "puzzle", "group activity", "experience", "fun"] },
  { retailer: "bowlero", source_id: "BO_BOWLING", title: "Bowling & Dinner for 4", brand: "Bowlero", category: "Experiences", price_cents: 12000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1525953185866-e4f65a4c0e54?w=300&h=300&fit=crop"], keywords: ["bowling", "dinner", "group", "date night", "experience"] },
  { retailer: "sur-la-table", source_id: "SLT_COOKING", title: "Cooking Class for 2", brand: "Sur La Table", category: "Experiences", price_cents: 16000, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300&h=300&fit=crop"], keywords: ["cooking class", "food", "chef", "date", "experience"] },

  // Home & Kitchen
  { retailer: "amazon", source_id: "AMZ_INSTANT_POT", title: "Instant Pot Duo 7-in-1 Pressure Cooker", brand: "Instant Pot", category: "Home & Kitchen", price_cents: 9900, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1588708215982-f54817a0210f?w=300&h=300&fit=crop"], keywords: ["instant pot", "pressure cooker", "kitchen", "cooking", "appliance"] },
  { retailer: "target", source_id: "TG_AIR_FRYER", title: "Ninja Air Fryer XL", brand: "Ninja", category: "Home & Kitchen", price_cents: 12999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop"], keywords: ["air fryer", "ninja", "kitchen", "cooking", "fryer"] },
  { retailer: "amazon", source_id: "AMZ_KITCHENAID", title: "KitchenAid Artisan Stand Mixer", brand: "KitchenAid", category: "Home & Kitchen", price_cents: 39999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300&h=300&fit=crop"], keywords: ["stand mixer", "kitchenaid", "baking", "kitchen", "mixer"] },
  { retailer: "bestbuy", source_id: "BB_DYSON_V15", title: "Dyson V15 Detect Cordless Vacuum", brand: "Dyson", category: "Home & Kitchen", price_cents: 74999, currency: "USD", availability: "in_stock", images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300&h=300&fit=crop"], keywords: ["vacuum", "dyson", "cordless", "cleaning", "home"] },
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Allow unauthenticated browsing — only match creation needs auth
        let user = null;
        try { user = await base44.auth.me(); } catch { user = null; }

        const body = await req.json();
        const { q, category, filters = {} } = body;

        if (!q || q.trim().length < 2) {
            return Response.json({ success: true, products: [], games: [] });
        }

        // Filter from unified mock DB
        let results = MOCK_PRODUCTS.filter(p => matchesQuery(p, q));

        // Optionally filter by category
        if (category) {
            results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        // Normalize and dedupe
        const products = normalizeAndDedupe(results);

        // Rank
        const ranked = rankProducts(products, q);

        return Response.json({ success: true, products: ranked, games: [] });

    } catch (error) {
        console.error("Error in searchProducts:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function normalizeAndDedupe(offers) {
    const productMap = new Map();

    offers.forEach(offer => {
        const gtin = offer.gtins ? offer.gtins[0] : null;
        const fallbackKey = `${offer.brand}-${offer.title}`.toLowerCase().replace(/\s+/g, '');
        const key = gtin || fallbackKey;

        const newOffer = {
            retailer: offer.retailer,
            source_id: offer.source_id,
            currency: offer.currency,
            price_cents: offer.price_cents,
            availability: offer.availability,
            product_url: offer.product_url || null,
            ttl_expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
        };

        if (productMap.has(key)) {
            productMap.get(key).offers.push(newOffer);
        } else {
            productMap.set(key, {
                id: `prod_${Math.random().toString(36).substr(2, 9)}`,
                title: offer.title,
                brand: offer.brand,
                category: offer.category,
                images: offer.images || [],
                offers: [newOffer],
                gtins: offer.gtins || [],
                keywords: offer.keywords || [],
                score: { popularity: 0, freshness: 1.0 }
            });
        }
    });

    return Array.from(productMap.values());
}

function rankProducts(products, query) {
    return products.sort((a, b) => {
        const scoreA = calculateRelevance(a, query);
        const scoreB = calculateRelevance(b, query);
        if (scoreA === scoreB) {
            const bestA = Math.min(...a.offers.map(o => o.price_cents));
            const bestB = Math.min(...b.offers.map(o => o.price_cents));
            return bestA - bestB;
        }
        return scoreB - scoreA;
    });
}

function calculateRelevance(product, query) {
    const q = query.toLowerCase();
    const titleLower = product.title.toLowerCase();
    let score = 0;
    if (titleLower.includes(q)) score += 5;
    if ((product.brand || "").toLowerCase().includes(q)) score += 3;
    if (product.offers.some(o => o.availability === 'in_stock')) score += 2;
    score += product.offers.length * 0.1;
    return score;
}