import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, Search, Filter, Star, Heart } from "lucide-react";

// ─── Partner Data ────────────────────────────────────────────────────────────
const PARTNERS = [
  // Retail & General Prizes
  { id: "amazon", name: "Amazon", category: "Retail & General Prizes", logo: "📦", description: "General retail marketplace for electronics, toys, home goods, sports gear, and prize items.", websiteUrl: "https://www.amazon.com", affiliateUrl: "", affiliateNetwork: "Amazon Associates", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "walmart", name: "Walmart", category: "Retail & General Prizes", logo: "🏪", description: "One-stop shop for everyday items, electronics, toys, and general merchandise.", websiteUrl: "https://www.walmart.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "target", name: "Target", category: "Retail & General Prizes", logo: "🎯", description: "Curated retail destination for home goods, clothing, electronics, and gifts.", websiteUrl: "https://www.target.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "bestbuy", name: "Best Buy", category: "Retail & General Prizes", logo: "🔵", description: "Leading retailer for consumer electronics, appliances, and tech accessories.", websiteUrl: "https://www.bestbuy.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "ebay", name: "eBay", category: "Retail & General Prizes", logo: "🛒", description: "Global marketplace for new, used, and collectible prize items at competitive prices.", websiteUrl: "https://www.ebay.com", affiliateUrl: "", affiliateNetwork: "eBay Partner Network", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },

  // Electronics & Gaming
  { id: "apple", name: "Apple", category: "Electronics & Gaming", logo: "🍎", description: "Premium electronics including iPhone, MacBook, iPad, AirPods, and Apple Watch.", websiteUrl: "https://www.apple.com", affiliateUrl: "", affiliateNetwork: "Apple Services", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "microsoft-store", name: "Microsoft Store", category: "Electronics & Gaming", logo: "🪟", description: "Xbox consoles, PC gaming accessories, Surface devices, and software.", websiteUrl: "https://www.microsoft.com/store", affiliateUrl: "", affiliateNetwork: "Microsoft", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "gamestop", name: "GameStop", category: "Electronics & Gaming", logo: "🎮", description: "Video games, gaming consoles, accessories, and collectibles.", websiteUrl: "https://www.gamestop.com", affiliateUrl: "", affiliateNetwork: "CJ Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "newegg", name: "Newegg", category: "Electronics & Gaming", logo: "🖥️", description: "Computer hardware, PC components, gaming peripherals, and tech products.", websiteUrl: "https://www.newegg.com", affiliateUrl: "", affiliateNetwork: "Newegg", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "dell", name: "Dell", category: "Electronics & Gaming", logo: "💻", description: "Laptops, desktops, gaming PCs, monitors, and business technology solutions.", websiteUrl: "https://www.dell.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },

  // Sports & Outdoor
  { id: "nike", name: "Nike", category: "Sports & Outdoor", logo: "👟", description: "Athletic footwear, apparel, and sporting equipment for all sports and activities.", websiteUrl: "https://www.nike.com", affiliateUrl: "", affiliateNetwork: "Rakuten", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "adidas", name: "Adidas", category: "Sports & Outdoor", logo: "⚽", description: "Sports apparel, footwear, and accessories for athletes and active lifestyles.", websiteUrl: "https://www.adidas.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "dicks", name: "Dick's Sporting Goods", category: "Sports & Outdoor", logo: "🏋️", description: "Full-service sporting goods retailer with gear for every sport and outdoor activity.", websiteUrl: "https://www.dickssportinggoods.com", affiliateUrl: "", affiliateNetwork: "CJ Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "rei", name: "REI", category: "Sports & Outdoor", logo: "🏕️", description: "Outdoor gear, clothing, and equipment for camping, hiking, climbing, and adventure sports.", websiteUrl: "https://www.rei.com", affiliateUrl: "", affiliateNetwork: "Awin", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "basspro", name: "Bass Pro Shops", category: "Sports & Outdoor", logo: "🎣", description: "Fishing, hunting, camping, and outdoor recreation gear and apparel.", websiteUrl: "https://www.basspro.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },

  // Vacations & Travel
  { id: "expedia", name: "Expedia Vacation Packages", category: "Vacations & Travel", logo: "✈️", description: "Full vacation packages including flights, hotels, and car rentals worldwide.", websiteUrl: "https://www.expedia.com/Vacation-Packages", affiliateUrl: "", affiliateNetwork: "Expedia Affiliate Network", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "bookingcom", name: "Booking.com", category: "Vacations & Travel", logo: "🏨", description: "Worldwide hotel, vacation rental, and travel booking platform.", websiteUrl: "https://www.booking.com", affiliateUrl: "", affiliateNetwork: "Booking.com Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "airbnb", name: "Airbnb", category: "Vacations & Travel", logo: "🏠", description: "Unique home stays, vacation rentals, and lodging experiences worldwide.", websiteUrl: "https://www.airbnb.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "vrbo", name: "Vrbo", category: "Vacations & Travel", logo: "🌴", description: "Vacation rental homes, cabins, and beach houses for families and groups.", websiteUrl: "https://www.vrbo.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "tripadvisor", name: "Tripadvisor", category: "Vacations & Travel", logo: "🦉", description: "Hotels, flights, and vacation planning with millions of traveler reviews.", websiteUrl: "https://www.tripadvisor.com", affiliateUrl: "", affiliateNetwork: "Tripadvisor Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },

  // Event Tickets
  { id: "ticketmaster", name: "Ticketmaster", category: "Event Tickets", logo: "🎟️", description: "Official tickets for concerts, sports, theatre, and live events nationwide.", websiteUrl: "https://www.ticketmaster.com", affiliateUrl: "", affiliateNetwork: "CJ Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "stubhub", name: "StubHub", category: "Event Tickets", logo: "🏟️", description: "Resale marketplace for sports, concert, and live event tickets.", websiteUrl: "https://www.stubhub.com", affiliateUrl: "", affiliateNetwork: "Rakuten", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "seatgeek", name: "SeatGeek", category: "Event Tickets", logo: "💺", description: "Ticket search engine and fan-to-fan marketplace for all live events.", websiteUrl: "https://seatgeek.com", affiliateUrl: "", affiliateNetwork: "SeatGeek Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "vividseats", name: "Vivid Seats", category: "Event Tickets", logo: "🎭", description: "Secondary ticket marketplace for sports, concerts, and entertainment.", websiteUrl: "https://www.vividseats.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "eventbrite", name: "Eventbrite", category: "Event Tickets", logo: "🎪", description: "Local events, festivals, workshops, conferences, and community gatherings.", websiteUrl: "https://www.eventbrite.com", affiliateUrl: "", affiliateNetwork: "Eventbrite Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },

  // Cruises
  { id: "royalcaribbean", name: "Royal Caribbean", category: "Cruises", logo: "🚢", description: "World-class cruise vacations to the Caribbean, Mediterranean, Alaska, and beyond.", websiteUrl: "https://www.royalcaribbean.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "carnival", name: "Carnival Cruise Line", category: "Cruises", logo: "🎡", description: "Fun-filled cruise vacations for families and groups at a great value.", websiteUrl: "https://www.carnival.com", affiliateUrl: "", affiliateNetwork: "CJ Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "ncl", name: "Norwegian Cruise Line", category: "Cruises", logo: "⚓", description: "Freestyle cruising with flexible dining and destination experiences worldwide.", websiteUrl: "https://www.ncl.com", affiliateUrl: "", affiliateNetwork: "Rakuten", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "princess", name: "Princess Cruises", category: "Cruises", logo: "👑", description: "Premium cruise experiences to over 100 destinations around the world.", websiteUrl: "https://www.princess.com", affiliateUrl: "", affiliateNetwork: "CJ Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "celebrity", name: "Celebrity Cruises", category: "Cruises", logo: "⭐", description: "Award-winning premium cruises with exceptional dining, spa, and entertainment.", websiteUrl: "https://www.celebritycruises.com", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "tripadvisor-cruises", name: "Tripadvisor Cruises", category: "Cruises", logo: "🌊", description: "Compare and book cruises across all major cruise lines with traveler reviews.", websiteUrl: "https://www.tripadvisor.com/Cruises", affiliateUrl: "", affiliateNetwork: "Tripadvisor Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },

  // Concerts
  { id: "livenation", name: "Live Nation", category: "Concerts", logo: "🎵", description: "Official source for concerts, tours, and live music events worldwide.", websiteUrl: "https://www.livenation.com", affiliateUrl: "", affiliateNetwork: "CJ Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "ticketmaster-concerts", name: "Ticketmaster Concerts", category: "Concerts", logo: "🎤", description: "Official concert tickets for all major artists and touring acts.", websiteUrl: "https://www.ticketmaster.com/concerts", affiliateUrl: "", affiliateNetwork: "CJ Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "axs", name: "AXS", category: "Concerts", logo: "🎸", description: "Official ticketing for concerts, festivals, and major live entertainment events.", websiteUrl: "https://www.axs.com", affiliateUrl: "", affiliateNetwork: "AXS Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "bandsintown", name: "Bandsintown", category: "Concerts", logo: "🥁", description: "Concert discovery platform — track your favorite artists and find live shows.", websiteUrl: "https://www.bandsintown.com", affiliateUrl: "", affiliateNetwork: "Bandsintown", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "songkick", name: "Songkick", category: "Concerts", logo: "🎶", description: "Concert tracker and ticket marketplace for live music fans worldwide.", websiteUrl: "https://www.songkick.com", affiliateUrl: "", affiliateNetwork: "Songkick Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },

  // Experiences & Adventures
  { id: "viator", name: "Viator", category: "Experiences & Adventures", logo: "🗺️", description: "Book tours, activities, and experiences in destinations around the world.", websiteUrl: "https://www.viator.com", affiliateUrl: "", affiliateNetwork: "Viator Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "getyourguide", name: "GetYourGuide", category: "Experiences & Adventures", logo: "🎒", description: "Tours, tickets, and activities for travelers looking for unforgettable experiences.", websiteUrl: "https://www.getyourguide.com", affiliateUrl: "", affiliateNetwork: "GetYourGuide Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "klook", name: "Klook", category: "Experiences & Adventures", logo: "🌏", description: "Book experiences, activities, and travel services across Asia and worldwide.", websiteUrl: "https://www.klook.com/en-US", affiliateUrl: "", affiliateNetwork: "Klook Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "airbnb-exp", name: "Airbnb Experiences", category: "Experiences & Adventures", logo: "🌟", description: "Unique local experiences hosted by expert locals in cities around the world.", websiteUrl: "https://www.airbnb.com/experiences", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "fever", name: "Fever", category: "Experiences & Adventures", logo: "🎭", description: "Curated local events and experiences — immersive shows, pop-ups, and unique activities.", websiteUrl: "https://feverup.com", affiliateUrl: "", affiliateNetwork: "Fever Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "gadventures", name: "G Adventures", category: "Experiences & Adventures", logo: "🏔️", description: "Small group adventure travel and tours to destinations worldwide.", websiteUrl: "https://www.gadventures.com", affiliateUrl: "", affiliateNetwork: "CJ Affiliate", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
  { id: "intrepid", name: "Intrepid Travel", category: "Experiences & Adventures", logo: "🌄", description: "Responsible small-group tours and adventure travel across 100+ countries.", websiteUrl: "https://www.intrepidtravel.com/us", affiliateUrl: "", affiliateNetwork: "Impact", trackingId: "", affiliateStatus: "pending", sponsored: false, supportsNorthPoleFund: false, disclosureText: "" },
];

const ALL_CATEGORIES = [...new Set(PARTNERS.map(p => p.category))];

const STATUS_CONFIG = {
  pending:        { label: "Affiliate Ready",   color: "bg-slate-700/60 text-slate-300 border-slate-600/40" },
  applied:        { label: "Applied",           color: "bg-blue-900/40 text-blue-300 border-blue-700/30" },
  approved:       { label: "Approved",          color: "bg-cyan-900/40 text-cyan-300 border-cyan-700/30" },
  active:         { label: "Affiliate Active",  color: "bg-green-900/40 text-green-300 border-green-700/30" },
  denied:         { label: "Denied",            color: "bg-red-900/40 text-red-300 border-red-700/30" },
  inactive:       { label: "Inactive",          color: "bg-gray-800/60 text-gray-400 border-gray-700/30" },
  sponsored:      { label: "Sponsored Partner", color: "bg-yellow-900/40 text-yellow-300 border-yellow-700/30" },
  direct_partner: { label: "Direct Partner",   color: "bg-purple-900/40 text-purple-300 border-purple-700/30" },
};

function PartnerCard({ partner, onUsePrize }) {
  const outboundUrl =
    partner.affiliateStatus === "active" && partner.affiliateUrl
      ? partner.affiliateUrl
      : partner.websiteUrl;

  const statusCfg = STATUS_CONFIG[partner.affiliateStatus] || STATUS_CONFIG.pending;

  return (
    <div className="bg-purple-900/20 border border-purple-700/20 rounded-xl p-4 flex flex-col gap-3 hover:border-purple-600/40 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none mt-0.5">{partner.logo}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-sm truncate">{partner.name}</h3>
            {partner.sponsored && (
              <Badge className="bg-yellow-900/40 text-yellow-300 border border-yellow-700/30 text-[10px] px-1.5 py-0">
                <Star className="w-2.5 h-2.5 mr-0.5" />Sponsored
              </Badge>
            )}
            {partner.supportsNorthPoleFund && (
              <Badge className="bg-red-900/40 text-red-300 border border-red-700/30 text-[10px] px-1.5 py-0">
                <Heart className="w-2.5 h-2.5 mr-0.5" />NP Fund
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-purple-400/70 mt-0.5">{partner.category}</p>
        </div>
        <Badge className={`text-[10px] px-1.5 py-0 border shrink-0 ${statusCfg.color}`}>
          {statusCfg.label}
        </Badge>
      </div>

      <p className="text-xs text-purple-200/60 leading-relaxed">{partner.description}</p>

      <div className="flex gap-2 mt-auto">
        <a
          href={outboundUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-purple-700/50 hover:bg-purple-600/60 border border-purple-600/30 text-white text-xs font-medium rounded-lg px-3 py-2 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Shop Now
        </a>
        <button
          onClick={() => onUsePrize && onUsePrize(partner)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-cyan-900/40 hover:bg-cyan-800/50 border border-cyan-700/30 text-cyan-300 hover:text-cyan-200 text-xs font-medium rounded-lg px-3 py-2 transition-colors"
        >
          Use as Prize Source
        </button>
      </div>
    </div>
  );
}

export default function NorthPoleAffiliateDirectory({ onUsePrize }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sponsoredOnly, setSponsoredOnly] = useState(false);
  const [nfpOnly, setNfpOnly] = useState(false);

  const amazonPartner = PARTNERS.find(p => p.id === "amazon");
  const showAmazonDisclosure = amazonPartner?.affiliateStatus === "active" && amazonPartner?.affiliateUrl;

  const filtered = useMemo(() => {
    return PARTNERS.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (statusFilter !== "all" && p.affiliateStatus !== statusFilter) return false;
      if (sponsoredOnly && !p.sponsored) return false;
      if (nfpOnly && !p.supportsNorthPoleFund) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter, sponsoredOnly, nfpOnly]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(p => {
      if (!g[p.category]) g[p.category] = [];
      g[p.category].push(p);
    });
    return g;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">🎁 North Pole Prize Shopping Network</h2>
        <p className="text-purple-300 text-sm">
          Browse prize sources for gifts, travel, tickets, cruises, concerts, adventures, and experiences.
        </p>
      </div>

      {/* Affiliate Disclosure */}
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 text-xs text-yellow-200/70 space-y-1">
        <p className="font-semibold text-yellow-300">📢 Affiliate & Sponsorship Disclosure</p>
        <p>Some links may be affiliate or sponsored links. The Poles may earn a commission from qualifying purchases or bookings. Affiliate income may help support The Poles Fund and platform mission.</p>
        {showAmazonDisclosure && (
          <p className="text-yellow-300/80 font-medium">As an Amazon Associate I earn from qualifying purchases.</p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-purple-900/20 border border-purple-700/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">Filter Partners</span>
          <span className="text-xs text-purple-500 ml-auto">{filtered.length} of {PARTNERS.length} shown</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/50" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="bg-black/30 border-purple-700/30 text-white text-xs pl-8"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-black/30 border border-purple-700/30 rounded-md px-3 py-2 text-white text-xs"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-black/30 border border-purple-700/30 rounded-md px-3 py-2 text-white text-xs"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setSponsoredOnly(v => !v)}
              className={`flex-1 flex items-center justify-center gap-1 text-xs rounded-md border px-2 py-2 transition-colors ${sponsoredOnly ? "bg-yellow-900/40 border-yellow-700/40 text-yellow-300" : "bg-black/30 border-purple-700/30 text-purple-400"}`}
            >
              <Star className="w-3 h-3" /> Sponsored
            </button>
            <button
              onClick={() => setNfpOnly(v => !v)}
              className={`flex-1 flex items-center justify-center gap-1 text-xs rounded-md border px-2 py-2 transition-colors ${nfpOnly ? "bg-red-900/40 border-red-700/40 text-red-300" : "bg-black/30 border-purple-700/30 text-purple-400"}`}
            >
              <Heart className="w-3 h-3" /> NP Fund
            </button>
          </div>
        </div>
      </div>

      {/* Partner Grid by Category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-purple-400/50">
          <p className="text-lg">No partners match your filters.</p>
          <button onClick={() => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all"); setSponsoredOnly(false); setNfpOnly(false); }} className="text-sm text-purple-400 mt-2 underline">Clear filters</button>
        </div>
      ) : (
        Object.entries(grouped).map(([category, partners]) => (
          <div key={category}>
            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-purple-700/50 inline-block" />
              {category}
              <span className="text-purple-500 font-normal normal-case tracking-normal">({partners.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {partners.map(p => (
                <PartnerCard key={p.id} partner={p} onUsePrize={onUsePrize} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
