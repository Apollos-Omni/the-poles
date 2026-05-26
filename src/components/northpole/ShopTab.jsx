import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import { searchProducts } from '@/functions/searchProducts';
import NorthPoleAffiliateDirectory from './NorthPoleAffiliateDirectory';
import { VideoBackgroundCard, mediaImages } from '@/components/media/MediaPrimitives';

const CATEGORIES = [
  { label: "Electronics", icon: "📱" },
  { label: "Gaming", icon: "🎮" },
  { label: "Sneakers", icon: "👟" },
  { label: "Sports Gear", icon: "⚽" },
  { label: "Toys", icon: "🧸" },
  { label: "Event Tickets", icon: "🎟️" },
  { label: "Vacations", icon: "✈️" },
  { label: "Experiences", icon: "🌟" },
  { label: "Home & Kitchen", icon: "🏠" },
];

const DEMO_PRODUCTS = {
  "Electronics": [
    { id: "e1", title: "Sony WH-1000XM5 Headphones", price: 29999, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", retailer: "Best Buy", category: "Electronics" },
    { id: "e2", title: "iPad Air 10.9\"", price: 59900, image: "https://images.unsplash.com/photo-1544244015-0df4592c8487?w=400", retailer: "Apple", category: "Electronics" },
    { id: "e3", title: "JBL Flip 6 Speaker", price: 12999, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", retailer: "Amazon", category: "Electronics" },
    { id: "e4", title: "Samsung Galaxy Tab S9", price: 79900, image: "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400", retailer: "Samsung", category: "Electronics" },
    { id: "e5", title: "Apple AirPods Pro 2nd Gen", price: 24900, image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400", retailer: "Apple", category: "Electronics" },
    { id: "e6", title: "Gaming Monitor 27\" 144Hz", price: 34999, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", retailer: "Amazon", category: "Electronics" },
  ],
  "Gaming": [
    { id: "g1", title: "Nintendo Switch OLED", price: 34999, image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?w=400", retailer: "Nintendo", category: "Gaming" },
    { id: "g2", title: "PlayStation 5 Controller", price: 6999, image: "https://images.unsplash.com/photo-1592890288564-76628a30a657?w=400", retailer: "Sony", category: "Gaming" },
    { id: "g3", title: "Xbox Game Pass Ultimate (3mo)", price: 4499, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", retailer: "Microsoft", category: "Gaming" },
    { id: "g4", title: "Gaming Chair Pro Series", price: 29900, image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400", retailer: "Amazon", category: "Gaming" },
    { id: "g5", title: "Razer Gaming Headset", price: 9999, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", retailer: "Razer", category: "Gaming" },
    { id: "g6", title: "Steam Gift Card $50", price: 5000, image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=400", retailer: "Steam", category: "Gaming" },
  ],
  "Sneakers": [
    { id: "s1", title: "Nike Air Max 270", price: 15000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", retailer: "Nike", category: "Sneakers" },
    { id: "s2", title: "Adidas Ultraboost 22", price: 18000, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400", retailer: "Adidas", category: "Sneakers" },
    { id: "s3", title: "Jordan 1 Retro High", price: 17000, image: "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400", retailer: "Nike", category: "Sneakers" },
    { id: "s4", title: "New Balance 990v5", price: 17500, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400", retailer: "New Balance", category: "Sneakers" },
    { id: "s5", title: "Converse Chuck Taylor All Star", price: 6500, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400", retailer: "Converse", category: "Sneakers" },
    { id: "s6", title: "Under Armour HOVR Phantom", price: 14000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", retailer: "Under Armour", category: "Sneakers" },
  ],
  "Sports Gear": [
    { id: "sg1", title: "Spalding NBA Basketball", price: 4999, image: "https://images.unsplash.com/photo-1546519638405-a9f9024ea68f?w=400", retailer: "Amazon", category: "Sports Gear" },
    { id: "sg2", title: "Wilson Soccer Ball (Match)", price: 3999, image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400", retailer: "Sports Authority", category: "Sports Gear" },
    { id: "sg3", title: "Bowflex Adjustable Dumbbells", price: 39900, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", retailer: "Amazon", category: "Sports Gear" },
    { id: "sg4", title: "Football Cleats Pro", price: 8999, image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400", retailer: "Nike", category: "Sports Gear" },
    { id: "sg5", title: "Fitness Tracker Band", price: 9900, image: "https://images.unsplash.com/photo-1576243345690-4e4b79b09b23?w=400", retailer: "Fitbit", category: "Sports Gear" },
    { id: "sg6", title: "Batting Gloves Pro Set", price: 2999, image: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400", retailer: "Amazon", category: "Sports Gear" },
  ],
  "Toys": [
    { id: "t1", title: "LEGO Star Wars Millennium Falcon", price: 84999, image: "https://images.unsplash.com/photo-1585366119957-e25a4b6c7128?w=400", retailer: "LEGO", category: "Toys" },
    { id: "t2", title: "Remote Control Monster Truck", price: 4999, image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400", retailer: "Target", category: "Toys" },
    { id: "t3", title: "Hot Wheels Track Set Deluxe", price: 3999, image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400", retailer: "Walmart", category: "Toys" },
    { id: "t4", title: "Marvel Action Figure Set", price: 2999, image: "https://images.unsplash.com/photo-1608889175157-1f1e1b98fdc7?w=400", retailer: "Target", category: "Toys" },
  ],
  "Event Tickets": [
    { id: "ev1", title: "NBA Game Tickets (2-pack)", price: 25000, image: "https://images.unsplash.com/photo-1546519638405-a9f9024ea68f?w=400", retailer: "Ticketmaster", category: "Event Tickets" },
    { id: "ev2", title: "Concert Tickets – General Admission (2x)", price: 20000, image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400", retailer: "StubHub", category: "Event Tickets" },
    { id: "ev3", title: "NFL Game Day Tickets (2-pack)", price: 40000, image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400", retailer: "Ticketmaster", category: "Event Tickets" },
    { id: "ev4", title: "Comedy Show – VIP (2x)", price: 15000, image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=400", retailer: "Eventbrite", category: "Event Tickets" },
    { id: "ev5", title: "Music Festival Weekend Pass", price: 35000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", retailer: "StubHub", category: "Event Tickets" },
    { id: "ev6", title: "Baseball Game Package (4 tickets)", price: 18000, image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400", retailer: "Ticketmaster", category: "Event Tickets" },
  ],
  "Vacations": [
    { id: "v1", title: "Weekend Hotel Stay (2 nights)", price: 80000, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400", retailer: "Airbnb", category: "Vacations" },
    { id: "v2", title: "Caribbean Cruise (3 nights, 2 people)", price: 150000, image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400", retailer: "Carnival", category: "Vacations" },
    { id: "v3", title: "Las Vegas Trip Package (2 nights)", price: 120000, image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400", retailer: "Expedia", category: "Vacations" },
    { id: "v4", title: "Disneyland 2-Day Park Hopper (2 tickets)", price: 60000, image: "https://images.unsplash.com/photo-1565060169861-3572d3d4f0e4?w=400", retailer: "Disney", category: "Vacations" },
  ],
  "Experiences": [
    { id: "x1", title: "Escape Room Private Booking (8 people)", price: 20000, image: "https://images.unsplash.com/photo-1529448005898-adb02a71bc3a?w=400", retailer: "Local Partner", category: "Experiences" },
    { id: "x2", title: "Indoor Skydiving (2 people)", price: 15000, image: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400", retailer: "iFLY", category: "Experiences" },
    { id: "x3", title: "Go-Kart Racing Session (4 people)", price: 8000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", retailer: "Local Partner", category: "Experiences" },
    { id: "x4", title: "Bowling & Dinner for 4", price: 12000, image: "https://images.unsplash.com/photo-1525953185866-e4f65a4c0e54?w=400", retailer: "Bowlero", category: "Experiences" },
    { id: "x5", title: "Cooking Class for 2", price: 16000, image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400", retailer: "Sur La Table", category: "Experiences" },
    { id: "x6", title: "Paintball Group Package (8 people)", price: 25000, image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400", retailer: "Local Arena", category: "Experiences" },
  ],
  "Home & Kitchen": [
    { id: "hk1", title: "Instant Pot Duo 7-in-1", price: 9900, image: "https://images.unsplash.com/photo-1588708215982-f54817a0210f?w=400", retailer: "Amazon", category: "Home & Kitchen" },
    { id: "hk2", title: "Ninja Air Fryer XL", price: 12999, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", retailer: "Target", category: "Home & Kitchen" },
    { id: "hk3", title: "KitchenAid Stand Mixer", price: 39999, image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400", retailer: "Williams Sonoma", category: "Home & Kitchen" },
    { id: "hk4", title: "Dyson V15 Vacuum", price: 74999, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400", retailer: "Best Buy", category: "Home & Kitchen" },
  ],
};

function normalizeSearchProduct(product) {
  const bestOffer = product.offers?.find(o => o.availability === 'in_stock') || product.offers?.[0];
  return {
    id: product.id,
    title: product.title,
    brand: product.brand || product.category || "North Pole Prize",
    category: product.category,
    price_cents: bestOffer?.price_cents || product.price_cents || 0,
    images: product.images || [],
    image_url: product.images?.[0] || "",
    offers: product.offers || [{ retailer: "North Pole Search", price_cents: product.price_cents || 0, availability: "in_stock", product_url: null }]
  };
}

function PrizeCard({ product, onSelect }) {
  return (
    <div className="bg-black/40 border border-purple-700/20 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all flex flex-col">
      <div className="h-40 bg-black/30 flex items-center justify-center overflow-hidden">
        <img src={product.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=400'; }} />
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs w-fit">{product.category}</Badge>
        <h4 className="font-semibold text-white text-sm leading-tight line-clamp-2">{product.title}</h4>
        <p className="text-sm font-bold text-purple-300">${(product.price / 100).toFixed(2)}</p>
        <p className="text-xs text-purple-400/60">via {product.retailer}</p>
        <div className="flex gap-2 mt-auto pt-2">
          <Button size="sm" variant="outline" className="flex-1 border-purple-700/40 text-purple-300 text-xs" onClick={() => onSelect(product, 'view')}>
            View Prize
          </Button>
          <Button size="sm" className="flex-1 bg-purple-700 hover:bg-purple-600 text-white text-xs" onClick={() => onSelect(product, 'create')}>
            🏆 Select Prize
          </Button>
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ product, onCreateMatch }) {
  const bestOffer = product.offers?.find(o => o.availability === 'in_stock') || product.offers?.[0];
  return (
    <div className="bg-black/40 border border-purple-700/20 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all flex flex-col">
      <div className="h-40 bg-black/30 flex items-center justify-center overflow-hidden">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=400'}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=400'; }}
        />
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Badge className="bg-purple-900/40 text-purple-300 border-purple-700/30 text-xs w-fit">{product.category || "Prize"}</Badge>
        <h4 className="font-semibold text-white text-sm leading-tight line-clamp-2">{product.title}</h4>
        <p className="text-sm font-bold text-purple-300">${((bestOffer?.price_cents || 0) / 100).toFixed(2)}</p>
        <p className="text-xs text-purple-400/60">via {bestOffer?.retailer || product.brand || "Retailer"}</p>
        <Button
          size="sm"
          className="w-full mt-auto bg-purple-700 hover:bg-purple-600 text-white text-xs"
          disabled={!bestOffer || bestOffer.availability !== 'in_stock'}
          onClick={() => onCreateMatch(product)}
        >
          🏆 Create Match With This Prize
        </Button>
      </div>
    </div>
  );
}

function PrizeSetupPreview({ prize, onCreateMatch, buyInForPlayers }) {
  if (!prize) {
    return (
      <div className="bg-black/30 border border-purple-700/20 rounded-2xl p-5 text-center">
        <p className="text-purple-400/60 text-sm">No prize selected yet.</p>
        <p className="text-purple-400/40 text-xs mt-1">Click "Select Prize" on any item above.</p>
        <Button disabled className="mt-4 w-full bg-purple-900/40 text-purple-500 cursor-not-allowed text-sm">
          Create Match With This Prize
        </Button>
      </div>
    );
  }

  const players = 10;
  const uplift = { marginPct: 0.05, feesPct: 0.03, bufferPct: 0.02 };
  const entryPerPlayer = buyInForPlayers(prize.price, uplift, players);
  const donation = (prize.price / 100 * 0.1).toFixed(2);

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-5 space-y-3">
      <h4 className="font-bold text-white text-sm">🏆 Prize Setup Preview</h4>
      <div className="flex gap-3 items-start">
        <img src={prize.image} alt="" loading="lazy" decoding="async" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?w=60'; }} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">{prize.title}</p>
          <p className="text-purple-300 text-xs">via {prize.retailer}</p>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-purple-200/70">
        <div className="flex justify-between"><span>Prize Price</span><span className="text-white font-semibold">${(prize.price / 100).toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Players</span><span className="text-white font-semibold">{players}</span></div>
        <div className="flex justify-between"><span>Est. Entry/Player</span><span className="text-green-300 font-semibold">${entryPerPlayer.toFixed(2)}</span></div>
        <div className="flex justify-between items-center"><span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400" /> The Poles Fund</span><span className="text-pink-300 font-semibold">Funded</span></div>
      </div>
      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm" onClick={onCreateMatch}>
        🎮 Create Match With This Prize
      </Button>
    </div>
  );
}

export default function ShopTab({ onCreateMatch, buyInForPlayers }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchProviderMessage, setSearchProviderMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const performProductSearch = async (query, category) => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError('');
      setSearchProviderMessage('');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const { data } = await searchProducts({ q: cleanQuery, category: category || null, filters: {} });
      if (data?.success) {
        setSearchResults(data.products || []);
        setSearchProviderMessage(data.providerMessage || '');
      } else {
        throw new Error(data?.error || "Product search failed.");
      }
    } catch (error) {
      console.error("North Pole Shop search error:", error);
      setSearchError(error.message || "Unable to search products right now.");
      setSearchProviderMessage('');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((query, category) => performProductSearch(query, category), 400),
    []
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    debouncedSearch(value, selectedCategory);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchError('');
    setSearchProviderMessage('');
  };

  const handleCreateMatchFromSearch = (product) => {
    const normalized = normalizeSearchProduct(product);
    localStorage.setItem('northPoleSelectedPrize', JSON.stringify(normalized));
    if (onCreateMatch) {
      onCreateMatch(normalized);
    } else {
      navigate('/CreateMatch');
    }
  };

  const handleProductAction = (product, action) => {
    if (!product?.id) {
      alert("This prize is missing required product data.");
      return;
    }
    if (action === 'view') {
      setSelectedPrize(product);
      return;
    }
    if (action === 'create') {
      setSelectedPrize(product);
      handleDemoCreateMatch(product);
      return;
    }
  };

  const handleDemoCreateMatch = (prize) => {
    if (!prize?.id) return;
    const prizeData = {
      id: prize.id,
      title: prize.title,
      image: prize.image,
      price: prize.price,
      retailer: prize.retailer,
      category: prize.category,
      url: prize.url || null,
    };
    localStorage.setItem('northPoleSelectedPrize', JSON.stringify(prizeData));
    if (onCreateMatch) {
      onCreateMatch(prize);
    } else {
      navigate('/CreateMatch');
    }
  };

  const shouldShowDemoProducts = !hasSearched || searchQuery.trim().length < 2;

  const demoProducts = (() => {
    const pool = selectedCategory ? (DEMO_PRODUCTS[selectedCategory] || []) : Object.values(DEMO_PRODUCTS).flat();
    return pool;
  })();

  const sectionTitle = selectedCategory ? `Popular ${selectedCategory} Prizes` : 'All Featured Prizes';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">🎁 Santa Clause Shop</h2>
        <p className="text-purple-300 max-w-2xl mx-auto text-sm">
          Search for any prize, pick it, and jump straight into Create Match. Browse categories below or search anything.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <VideoBackgroundCard title="Prize vault browsing" description="Browse products like potential match posters, not static rows." image={mediaImages.catalogShelf} label="Shop" metric="Prize" />
        <VideoBackgroundCard title="Creator campaign room" description="A strong prize image makes the invitation easier to promote." image={mediaImages.creatorDesk} label="Promote" metric="Room" />
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search for AirPods, PS5, shoes, bikes, tickets, toys..."
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          className="flex-1 bg-black/30 border-purple-700/30 focus:border-purple-500 text-white placeholder:text-purple-400"
        />
        {searchQuery && (
          <Button variant="outline" className="border-purple-700/40 text-purple-300" onClick={clearSearch}>
            Clear
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setSelectedCategory(cat.label)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${selectedCategory === cat.label ? 'bg-purple-700 text-white' : 'bg-black/30 border border-purple-700/30 text-purple-300 hover:border-purple-500'}`}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Main content — product grid + sticky sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">

          {/* Search state feedback */}
          {isSearching && (
            <div className="flex items-center justify-center py-8 text-purple-300">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Searching for prizes...
            </div>
          )}

          {searchError && (
            <div className="bg-red-900/30 border border-red-700/40 text-red-300 rounded-xl p-4 text-sm">
              {searchError}
            </div>
          )}

          {searchProviderMessage && !searchError && (
            <div className="bg-yellow-950/25 border border-yellow-700/40 text-yellow-100 rounded-xl p-4 text-sm">
              {searchProviderMessage}
            </div>
          )}

          {hasSearched && !isSearching && !searchError && searchResults.length === 0 && (
            <div className="bg-black/30 border border-purple-700/20 rounded-xl p-6 text-center text-purple-300">
              No products found for "{searchQuery}". Try a different search term or browse below.
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && !isSearching && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Search Results</h3>
                <span className="text-xs text-purple-400/60">{searchResults.length} results</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {searchResults.map(product => (
                  <SearchResultCard key={product.id} product={product} onCreateMatch={handleCreateMatchFromSearch} />
                ))}
              </div>
            </div>
          )}

          {/* Demo Products (shown when no search active) */}
          {shouldShowDemoProducts && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">{sectionTitle}</h3>
                <span className="text-xs text-purple-400/60">{demoProducts.length} prizes</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {demoProducts.map(p => (
                  <PrizeCard key={p.id} product={p} onSelect={handleProductAction} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prize Setup Sidebar */}
        <div className="lg:sticky lg:top-4">
          <PrizeSetupPreview
            prize={selectedPrize}
            onCreateMatch={() => handleDemoCreateMatch(selectedPrize)}
            buyInForPlayers={buyInForPlayers}
          />
          {selectedPrize && (
            <button className="mt-2 text-xs text-purple-400/60 hover:text-purple-300 w-full text-center" onClick={() => setSelectedPrize(null)}>
              Clear selection
            </button>
          )}
        </div>
      </div>

      {/* Partner Prize Network */}
      <div className="pt-6 border-t border-purple-700/20">
        <NorthPoleAffiliateDirectory onUsePrize={() => {}} />
      </div>
    </div>
  );
}
