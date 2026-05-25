import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Search, ExternalLink, ArrowLeft, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaHero, PrizeMediaCard, mediaImages } from "@/components/media/MediaPrimitives";

const CATEGORIES = [
  "All",
  "Electronics & Gaming",
  "Sports & Outdoor",
  "Vacations & Travel",
  "Event Tickets",
  "Cruises",
  "Concerts",
  "Experiences & Adventures",
  "Retail & General Prizes",
  "Kids & Gifts",
];

const CATEGORY_EMOJIS = {
  "Electronics & Gaming": "🎮",
  "Sports & Outdoor": "⚽",
  "Vacations & Travel": "✈️",
  "Event Tickets": "🎟️",
  "Cruises": "🚢",
  "Concerts": "🎵",
  "Experiences & Adventures": "🧗",
  "Retail & General Prizes": "🛍️",
  "Kids & Gifts": "🎁",
};

export default function AffiliateCatalog() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    base44.entities.AffiliateOffer.filter({ active: true })
      .then(data => setOffers(data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = offers.filter(o => {
    const matchCat = activeCategory === "All" || o.category === activeCategory;
    const matchSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase()) || o.merchant?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white">
      <MediaHero
        eyebrow="Prize catalog"
        title="Shop the feeling before the match."
        description="Prize rooms need visual stakes: gaming gear, sports gear, travel, tickets, creative tools, and approved gift categories presented as trustworthy media cards."
        image={mediaImages.catalogShelf}
        badges={["Affiliate disclosure", "Prize discovery", "Media-first cards"]}
        primaryAction={{ href: "/NorthPole", label: "Create a prize room" }}
        secondaryAction={{ href: "/SouthPole", label: "Create an event" }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center gap-4">
          <Link to="/ThePoles" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">Prize & Product Catalog</h1>
            <p className="text-purple-300/60 text-sm">Browse prizes and discover products from our retail partners</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 flex gap-2 text-xs text-yellow-200/80">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <span>Some links are paid affiliate links. We may earn a commission at no cost to you. <Link to="/AffiliateDisclosure" className="underline">Learn more</Link></span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PrizeMediaCard title="Gaming and creator gear" description="Use prizes that feel competitive, aspirational, and shareable." image={mediaImages.northPrize} meta="North Pole" />
          <PrizeMediaCard title="Sports and training gear" description="Support athletes, teams, leagues, and local competition." image={mediaImages.southTeam} meta="South Pole" />
          <PrizeMediaCard title="Approved gift categories" description="Keep mission visuals category-based and public-safe." image={mediaImages.fundTools} meta="Fund" />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-purple-400/60" />
          <Input
            placeholder="Search products, prizes, retailers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-black/40 border-purple-700/30 text-white placeholder:text-purple-400/40"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-purple-700 text-white"
                  : "bg-black/40 border border-purple-700/20 text-purple-300/70 hover:border-purple-500/40"
              }`}
            >
              {CATEGORY_EMOJIS[cat] || ""} {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-purple-400/60">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-purple-400/60">No offers found. Try a different category or search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(offer => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer }) {
  const ago = offer.price_last_checked
    ? new Date(offer.price_last_checked).toLocaleDateString()
    : null;

  return (
    <div className="bg-black/40 border border-purple-700/20 rounded-2xl overflow-hidden flex flex-col hover:border-purple-500/40 transition-colors">
      {offer.image_url && (
        <img src={offer.image_url} alt={offer.title} loading="lazy" decoding="async" className="w-full h-44 object-cover" />
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="outline" className="text-xs border-purple-700/30 text-purple-400 mb-1">
              {CATEGORY_EMOJIS[offer.category] || ""} {offer.category}
            </Badge>
            <h3 className="font-semibold text-white text-sm leading-snug">{offer.title}</h3>
            <p className="text-purple-300/60 text-xs mt-0.5">via {offer.merchant}</p>
          </div>
          {offer.price_display && (
            <span className="text-green-400 font-bold text-sm whitespace-nowrap">{offer.price_display}</span>
          )}
        </div>

        {offer.description && (
          <p className="text-purple-200/60 text-xs leading-relaxed line-clamp-2">{offer.description}</p>
        )}

        <div className="mt-auto space-y-2">
          {ago && <p className="text-purple-400/40 text-xs">Price checked: {ago}</p>}
          <p className="text-yellow-400/70 text-xs">⚠️ Paid affiliate link — commission may be earned</p>
          <Link to={`/out/${offer.id}`}>
            <Button className="w-full bg-purple-700 hover:bg-purple-600 text-white text-sm" size="sm">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              View at {offer.merchant}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
