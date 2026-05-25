export const MISSION_SUPPORT_AMOUNTS = [
  { id: "mission_10", label: "$10 Mission Support", amountCents: 1000, contributionType: "mission_support", missionCategory: "Mission" },
  { id: "gift_growth_25", label: "$25 Gift Growth Support", amountCents: 2500, contributionType: "gift_growth_support", missionCategory: "Gift Growth" },
  { id: "community_50", label: "$50 Community Support", amountCents: 5000, contributionType: "community_support", missionCategory: "Community" },
  { id: "sponsor_100", label: "$100 Sponsor Support", amountCents: 10000, contributionType: "sponsor_support", missionCategory: "Sponsor Support" },
];

export const SPONSOR_PACKAGES = [
  { id: "founding_partner", label: "Founding Partner", amountCents: 25000, contributionType: "partner", missionCategory: "Founding Partner" },
  { id: "community_sponsor", label: "Community Sponsor", amountCents: 50000, contributionType: "sponsor", missionCategory: "Community Sponsor" },
  { id: "prize_room_sponsor", label: "Prize Room Sponsor", amountCents: 100000, contributionType: "sponsor", missionCategory: "Prize Room Sponsor" },
  { id: "league_sponsor", label: "League Sponsor", amountCents: 250000, contributionType: "sponsor", missionCategory: "League Sponsor" },
];

export const MISSION_CATEGORIES = [
  "Approved Gifts",
  "Books and Tools",
  "Sports Gear",
  "Art Supplies",
  "Music Tools",
  "Technology",
  "Community Service",
];

export const formatMoney = (amountCents, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format((amountCents || 0) / 100);
