// ─── Shared Demo Data for The Poles ───────────────────────────────────────────

export const DEMO_PRIZES = [
  // Electronics
  { id: "prize-1",  title: "Nintendo Switch OLED", category: "Gaming", provider: "demo", description: "Portable gaming console with vibrant OLED screen. Perfect for gaming on the go.", image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?w=400", estimatedValue: 34999 },
  { id: "prize-2",  title: "Apple AirPods Pro 2nd Gen", category: "Electronics", provider: "demo", description: "Premium wireless earbuds with Active Noise Cancellation and Adaptive Transparency.", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400", estimatedValue: 24900 },
  { id: "prize-9",  title: "Sony PlayStation 5 Console", category: "Gaming", provider: "demo", description: "Next-gen gaming console with ultra-high-speed SSD and immersive DualSense controller.", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400", estimatedValue: 49999 },
  { id: "prize-13", title: "Xbox Series X Console", category: "Gaming", provider: "demo", description: "Microsoft's most powerful console with 4K gaming and Xbox Game Pass compatibility.", image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400", estimatedValue: 49999 },
  { id: "prize-14", title: "iPhone 15 Pro", category: "Electronics", provider: "demo", description: "Apple's flagship smartphone with titanium design, A17 Pro chip, and USB-C port.", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", estimatedValue: 99900 },
  { id: "prize-15", title: "Samsung 65\" 4K QLED TV", category: "Electronics", provider: "demo", description: "Stunning 65-inch QLED display with quantum dot technology and smart features.", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400", estimatedValue: 129900 },
  { id: "prize-16", title: "Apple iPad Pro 12.9\"", category: "Electronics", provider: "demo", description: "The most advanced iPad with M2 chip, Liquid Retina XDR display, and Apple Pencil support.", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", estimatedValue: 109900 },

  // Sneakers & Apparel
  { id: "prize-6",  title: "Nike Air Jordan 1 Retro High", category: "Sneakers", provider: "demo", description: "Iconic basketball shoe with premium leather upper in classic colorway.", image: "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400", estimatedValue: 17000 },
  { id: "prize-17", title: "Nike Air Max 270", category: "Sneakers", provider: "demo", description: "Lifestyle shoe with the biggest Air unit yet for all-day comfort.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", estimatedValue: 15000 },
  { id: "prize-18", title: "Adidas Yeezy Boost 350 V2", category: "Sneakers", provider: "demo", description: "Kanye West x Adidas collaboration featuring Primeknit upper and Boost cushioning.", image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400", estimatedValue: 22000 },

  // Sports Equipment
  { id: "prize-19", title: "Callaway Epic Max Driver", category: "Sports Equipment", provider: "demo", description: "High-performance golf driver with AI-designed face and jailbreak technology.", image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400", estimatedValue: 59900 },
  { id: "prize-20", title: "Peloton Bike+", category: "Sports Equipment", provider: "demo", description: "Connected fitness bike with rotating touchscreen, auto-follow resistance, and Apple GymKit.", image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400", estimatedValue: 249900 },
  { id: "prize-21", title: "Wilson Evolution Basketball", category: "Sports Equipment", provider: "demo", description: "Official game ball used in high school basketball. Composite leather cover.", image: "https://images.unsplash.com/photo-1546519638405-a9f9024ea68f?w=400", estimatedValue: 14900 },
  { id: "prize-22", title: "DJI Mavic 3 Drone", category: "Sports Equipment", provider: "demo", description: "Professional camera drone with Hasselblad camera and 46-min max flight time.", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400", estimatedValue: 199900 },

  // Gift Cards
  { id: "prize-23", title: "Amazon $500 Gift Card", category: "Gift Cards", provider: "demo", description: "Amazon e-gift card — shop millions of products across every category.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400", estimatedValue: 50000 },
  { id: "prize-24", title: "Visa $250 Prepaid Gift Card", category: "Gift Cards", provider: "demo", description: "Use anywhere Visa is accepted — online, in-store, worldwide.", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400", estimatedValue: 25000 },
  { id: "prize-25", title: "Best Buy $300 Gift Card", category: "Gift Cards", provider: "demo", description: "Best Buy gift card for electronics, appliances, and tech accessories.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400", estimatedValue: 30000 },

  // Vacations & Travel
  { id: "prize-5",  title: "Weekend Hotel Getaway (2 nights)", category: "Vacations", provider: "demo", description: "Luxury 2-night hotel stay for two at a 4-star property. Breakfast included.", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400", estimatedValue: 80000 },
  { id: "prize-26", title: "Las Vegas Weekend Trip (2 people)", category: "Vacations", provider: "demo", description: "3-night Las Vegas hotel stay for 2 with flight credit and resort credits.", image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400", estimatedValue: 200000 },
  { id: "prize-27", title: "Cancun All-Inclusive Resort (4 nights)", category: "Vacations", provider: "demo", description: "All-inclusive beachfront resort for two in Cancun, Mexico. Flights included.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", estimatedValue: 350000 },

  // Cruises
  { id: "prize-3",  title: "Caribbean Cruise (2 people, 3 nights)", category: "Cruises", provider: "demo", description: "3-night Caribbean cruise for two aboard a Royal Caribbean ship. Meals included.", image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400", estimatedValue: 150000 },
  { id: "prize-28", title: "Alaska Glacier Cruise (7 nights)", category: "Cruises", provider: "demo", description: "7-night Alaskan cruise for two. Visit glaciers, wildlife, and stunning scenery.", image: "https://images.unsplash.com/photo-1573043473936-90ccfa00d6c3?w=400", estimatedValue: 400000 },
  { id: "prize-29", title: "Mediterranean Cruise Package", category: "Cruises", provider: "demo", description: "10-night Mediterranean cruise visiting Italy, Greece, and Spain for two.", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400", estimatedValue: 600000 },

  // Concerts
  { id: "prize-8",  title: "Concert Tickets (General Admission 2x)", category: "Concerts", provider: "demo", description: "2 general admission tickets to a top touring artist concert near you.", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400", estimatedValue: 20000 },
  { id: "prize-12", title: "Music Festival Weekend Pass", category: "Concerts", provider: "demo", description: "3-day festival weekend pass with camping and backstage experience access.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", estimatedValue: 35000 },
  { id: "prize-30", title: "VIP Concert Experience (2 tickets)", category: "Concerts", provider: "demo", description: "2 VIP tickets with meet & greet, merchandise bundle, and front-row access.", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400", estimatedValue: 75000 },

  // Event Tickets
  { id: "prize-4",  title: "NBA Game Tickets (2-pack)", category: "Event Tickets", provider: "demo", description: "2 tickets to an NBA regular season game. Club-level seats included.", image: "https://images.unsplash.com/photo-1546519638405-a9f9024ea68f?w=400", estimatedValue: 25000 },
  { id: "prize-31", title: "Super Bowl Experience Package", category: "Event Tickets", provider: "demo", description: "2 Super Bowl tickets plus hotel and travel package for the biggest game of the year.", image: "https://images.unsplash.com/photo-1567701621301-d88ddb0e02de?w=400", estimatedValue: 1000000 },
  { id: "prize-32", title: "World Series Tickets (2 seats)", category: "Event Tickets", provider: "demo", description: "2 World Series tickets in the lower bowl. Includes field access pass.", image: "https://images.unsplash.com/photo-1591491719565-9394e0a09e4e?w=400", estimatedValue: 80000 },
  { id: "prize-33", title: "NFL Sunday Ticket (Full Season)", category: "Event Tickets", provider: "demo", description: "Full season NFL Sunday Ticket subscription — watch every out-of-market game.", image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400", estimatedValue: 45000 },

  // Adventures & Experiences
  { id: "prize-10", title: "Indoor Skydiving for 2", category: "Adventures", provider: "demo", description: "Experience the thrill of freefall at an indoor skydiving facility. 2 flight sessions.", image: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400", estimatedValue: 15000 },
  { id: "prize-34", title: "Hot Air Balloon Ride (2 passengers)", category: "Adventures", provider: "demo", description: "Sunrise hot air balloon flight for two with champagne toast and brunch.", image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400", estimatedValue: 40000 },
  { id: "prize-35", title: "Whitewater Rafting Weekend Adventure", category: "Adventures", provider: "demo", description: "2-day guided whitewater rafting trip for two including lodging and meals.", image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=400", estimatedValue: 55000 },
  { id: "prize-36", title: "Deep Sea Fishing Charter (4 people)", category: "Adventures", provider: "demo", description: "Full-day offshore fishing charter for up to 4 people. Equipment and bait included.", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400", estimatedValue: 80000 },
  { id: "prize-7",  title: "Disneyland 2-Day Park Hopper (2 tickets)", category: "Experiences", provider: "demo", description: "2 two-day park hopper tickets to Disneyland Resort — visit both parks.", image: "https://images.unsplash.com/photo-1565060169861-3572d3d4f0e4?w=400", estimatedValue: 60000 },
];

export const DEMO_GAMES = [
  // Real-world sports
  { id: "game-basketball", title: "Basketball", icon: "🏀", category: "Sports", type: "real-world", desc: "1v1, 3v3, or full 5v5 court basketball. Score-based or shootout format." },
  { id: "game-football",   title: "Football",   icon: "🏈", category: "Sports", type: "real-world", desc: "Flag or touch football. Touchdowns, passing yards, or Madden-style scoring." },
  { id: "game-soccer",     title: "Soccer",     icon: "⚽", category: "Sports", type: "real-world", desc: "5v5 or 7v7 match. Goals-based competition with verified final score." },
  { id: "game-baseball",   title: "Baseball",   icon: "⚾", category: "Sports", type: "real-world", desc: "Softball or hardball. Home run derby, batting average, or full innings." },
  { id: "game-pool",       title: "Pool / Billiards", icon: "🎱", category: "Sports", type: "real-world", desc: "8-ball, 9-ball, or straight pool. Winner by games won in best-of series." },
  { id: "game-bowling",    title: "Bowling",    icon: "🎳", category: "Sports", type: "real-world", desc: "Single game, series of 3 frames, or 9-pin no-tap format." },
  { id: "game-golf",       title: "Golf",       icon: "⛳", category: "Sports", type: "real-world", desc: "Stroke play, match play, or closest-to-pin challenge." },
  { id: "game-tennis",     title: "Tennis",     icon: "🎾", category: "Sports", type: "real-world", desc: "Singles or doubles sets. Best of 3 sets with standard scoring." },

  // Board & Table
  { id: "game-chess",      title: "Chess",      icon: "♟️", category: "Strategy", type: "digital", desc: "Classic chess — rated blitz, rapid, or puzzle battle format." },
  { id: "game-checkers",   title: "Checkers",   icon: "🔴", category: "Strategy", type: "digital", desc: "Classic checkers. Best-of-3 or timed format." },
  { id: "game-darts",      title: "Darts",      icon: "🎯", category: "Sports", type: "real-world", desc: "501, Cricket, or Around the Clock. Best-of-3 legs competition." },

  // Video Games
  { id: "game-madden",     title: "Madden NFL 25", icon: "🏈", category: "Video Games", type: "digital", desc: "EA Sports Madden NFL 25 — head-to-head franchise or quick match." },
  { id: "game-cod",        title: "Call of Duty",  icon: "🎮", category: "Video Games", type: "digital", desc: "Call of Duty multiplayer — kills, K/D ratio, or team score competition." },
  { id: "game-fortnite",   title: "Fortnite",      icon: "🎮", category: "Video Games", type: "digital", desc: "Fortnite Battle Royale — placement, eliminations, or survival challenge." },
  { id: "game-fifa",       title: "EA FC (FIFA)",  icon: "⚽", category: "Video Games", type: "digital", desc: "EA FC head-to-head. Best-of-3 matches or aggregate goal scoring." },
  { id: "game-nba2k",      title: "NBA 2K",        icon: "🏀", category: "Video Games", type: "digital", desc: "NBA 2K head-to-head. MyCareer challenge, Park, or full game." },
  { id: "game-mkart",      title: "Mario Kart 8",  icon: "🏎️", category: "Video Games", type: "digital", desc: "Mario Kart 8 Deluxe — best overall race position across 4-race cup." },
  { id: "game-smash",      title: "Super Smash Bros", icon: "💥", category: "Video Games", type: "digital", desc: "Stock, timed, or stamina battle. Best of 3 or 5 stock matches." },
  { id: "game-rocket",     title: "Rocket League", icon: "🚗", category: "Video Games", type: "digital", desc: "Rocket League 1v1 or 2v2 — goals scored in 5-minute matches." },

  // Custom
  { id: "game-trivia",  title: "Trivia Night",   icon: "🧠", category: "Trivia", type: "both", desc: "Custom trivia competition. Categories, timed rounds, verified scoring." },
  { id: "game-custom",  title: "Custom Game/Event", icon: "⚡", category: "Custom", type: "both", desc: "Define your own competition format. Verified by host or referee." },
];

export const DEMO_MATCHES = [
  {
    id: "m1", title: "SkyChess Blitz Championship", poleType: "north", gameType: "Chess / Strategy",
    hostId: "user_alex", hostName: "Alex M.", playersJoined: 7, playersNeeded: 10,
    startDate: "2026-05-20T19:00:00", status: "open", entryContribution: "$4.50",
    prizeId: "prize-1", prizeSnapshot: { title: "Nintendo Switch OLED", category: "Gaming", image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?w=400", estimatedValue: 34999 },
  },
  {
    id: "m2", title: "Neon Arena Duel — Weekend Series", poleType: "north", gameType: "Action / Arena",
    hostId: "user_sam", hostName: "Sam K.", playersJoined: 4, playersNeeded: 6,
    startDate: "2026-05-21T18:00:00", status: "open", entryContribution: "$5.00",
    prizeId: "prize-2", prizeSnapshot: { title: "Apple AirPods Pro 2nd Gen", category: "Electronics", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400", estimatedValue: 24900 },
  },
  {
    id: "m3", title: "Trivia Champion Finals", poleType: "north", gameType: "Trivia / Knowledge",
    hostId: "user_jordan", hostName: "Jordan P.", playersJoined: 8, playersNeeded: 8,
    startDate: "2026-05-19T20:00:00", status: "active", entryContribution: "$7.75",
    prizeId: "prize-9", prizeSnapshot: { title: "Sony PlayStation 5 Console", category: "Gaming", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400", estimatedValue: 49999 },
  },
  {
    id: "m4", title: "Dash & Drift Time Trial", poleType: "north", gameType: "Racing",
    hostId: "user_casey", hostName: "Casey R.", playersJoined: 2, playersNeeded: 4,
    startDate: "2026-05-25T14:00:00", status: "open", entryContribution: "$3.00",
    prizeId: "prize-6", prizeSnapshot: { title: "Nike Air Jordan 1 Retro High", category: "Sneakers", image: "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400", estimatedValue: 17000 },
  },
];

export const DEMO_EVENTS = [
  {
    id: "e1", title: "South Pole 5K Challenge", poleType: "south", eventType: "Racing / Fitness",
    hostId: "user_morgan", hostName: "Morgan L.", location: "City Central Park",
    playersJoined: 20, playersNeeded: 30, startDate: "2026-06-15T08:00:00", status: "open",
    entryContribution: "$25", donation: "$80",
    prizeId: "prize-5", prizeSnapshot: { title: "Weekend Hotel Getaway (2 nights)", category: "Vacations", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400", estimatedValue: 80000 },
  },
  {
    id: "e2", title: "Citywide Basketball Shootout", poleType: "south", eventType: "Sports",
    hostId: "user_riley", hostName: "Riley T.", location: "Downtown Sports Complex",
    playersJoined: 12, playersNeeded: 16, startDate: "2026-06-22T10:00:00", status: "open",
    entryContribution: "$20", donation: "$30",
    prizeId: "prize-4", prizeSnapshot: { title: "NBA Game Tickets (2-pack)", category: "Event Tickets", image: "https://images.unsplash.com/photo-1546519638405-a9f9024ea68f?w=400", estimatedValue: 25000 },
  },
  {
    id: "e3", title: "Escape Room Team Challenge", poleType: "south", eventType: "Team / Puzzle",
    hostId: "user_devon", hostName: "Devon W.", location: "Local Escape Room Co.",
    playersJoined: 8, playersNeeded: 12, startDate: "2026-07-04T13:00:00", status: "open",
    entryContribution: "$30", donation: "$20",
    prizeId: "prize-7", prizeSnapshot: { title: "Disneyland 2-Day Park Hopper (2 tickets)", category: "Experiences", image: "https://images.unsplash.com/photo-1565060169861-3572d3d4f0e4?w=400", estimatedValue: 60000 },
  },
  {
    id: "e4", title: "Cooking Battle Night", poleType: "south", eventType: "Culinary",
    hostId: "user_quinn", hostName: "Quinn B.", location: "Community Kitchen Studio",
    playersJoined: 5, playersNeeded: 8, startDate: "2026-07-12T17:00:00", status: "open",
    entryContribution: "$35", donation: "$15",
    prizeId: "prize-11", prizeSnapshot: { title: "KitchenAid Stand Mixer", category: "Products", image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400", estimatedValue: 39999 },
  },
  {
    id: "e5", title: "Concert Night Trivia Battle", poleType: "south", eventType: "Trivia / Music",
    hostId: "user_alex", hostName: "Alex M.", location: "Local Brewery & Event Hall",
    playersJoined: 24, playersNeeded: 40, startDate: "2026-07-26T19:00:00", status: "open",
    entryContribution: "$15", donation: "$20",
    prizeId: "prize-8", prizeSnapshot: { title: "Concert Tickets (General Admission 2x)", category: "Concerts", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400", estimatedValue: 20000 },
  },
  {
    id: "e6", title: "Weekend Adventure Challenge", poleType: "south", eventType: "Outdoor",
    hostId: "user_sam", hostName: "Sam K.", location: "State Park Trailhead",
    playersJoined: 10, playersNeeded: 24, startDate: "2026-08-16T07:00:00", status: "coming_soon",
    entryContribution: "$45", donation: "$60",
    prizeId: "prize-3", prizeSnapshot: { title: "Caribbean Cruise (2 people, 3 nights)", category: "Cruises", image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400", estimatedValue: 150000 },
  },
];

export const DEMO_FRIENDS = [
  { id: "f1", name: "Alex M.", avatar: "AM", status: "online", sharedEvents: ["m1", "e5"], wins: 4 },
  { id: "f2", name: "Sam K.", avatar: "SK", status: "in_game", sharedEvents: ["m2", "e6"], wins: 7 },
  { id: "f3", name: "Jordan P.", avatar: "JP", status: "offline", sharedEvents: ["m3"], wins: 12 },
  { id: "f4", name: "Casey R.", avatar: "CR", status: "online", sharedEvents: ["m4"], wins: 2 },
  { id: "f5", name: "Morgan L.", avatar: "ML", status: "online", sharedEvents: ["e1"], wins: 5 },
];

export const DEMO_PENDING_INVITES = [
  { id: "i1", from: "Sam K.", event: "Neon Arena Duel — Weekend Series", type: "north", date: "2026-05-21" },
  { id: "i2", from: "Morgan L.", event: "South Pole 5K Challenge", type: "south", date: "2026-06-15" },
];

export const PRIZE_CATEGORIES = [
  { label: "Vacations", icon: "✈️" },
  { label: "Concerts", icon: "🎵" },
  { label: "Cruises", icon: "🚢" },
  { label: "Event Tickets", icon: "🎟️" },
  { label: "Adventures", icon: "🏔️" },
  { label: "Experiences", icon: "🎭" },
  { label: "Products", icon: "📦" },
  { label: "Gaming", icon: "🎮" },
  { label: "Sneakers", icon: "👟" },
  { label: "Electronics", icon: "📱" },
  { label: "Sports Equipment", icon: "⚽" },
  { label: "Gift Cards", icon: "🎁" },
];

export const GAME_CATEGORIES = [
  { label: "Sports", icon: "🏅" },
  { label: "Video Games", icon: "🎮" },
  { label: "Strategy", icon: "♟️" },
  { label: "Trivia", icon: "🧠" },
  { label: "Custom", icon: "⚡" },
];

export function formatCountdown(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return "Started";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}