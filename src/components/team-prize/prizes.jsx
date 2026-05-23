export const TEAM_PRIZES = [
  { id: "tp-switch",    title: "Nintendo Switch OLED",      category: "Gaming",    price_cents: 34999, image_url: "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?q=80&w=400" },
  { id: "tp-ipad",      title: "Apple iPad (10th Gen)",     category: "Tech",      price_cents: 44900, image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400" },
  { id: "tp-airpods",   title: "AirPods Pro 2",             category: "Audio",     price_cents: 24900, image_url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=400" },
  { id: "tp-bike",      title: "Mountain Bike",             category: "Sports",    price_cents: 39900, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400" },
  { id: "tp-sneakers",  title: "Nike Air Jordan 1",         category: "Footwear",  price_cents: 18000, image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400" },
  { id: "tp-camera",    title: "Fujifilm Instax Camera",    category: "Photo",     price_cents: 8999,  image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400" },
  { id: "tp-scooter",   title: "Electric Scooter",          category: "Transport", price_cents: 49900, image_url: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=400" },
  { id: "tp-headphones",title: "Sony WH-1000XM5",           category: "Audio",     price_cents: 34900, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400" },
  { id: "tp-ps5",       title: "PlayStation 5 Controller", category: "Gaming",    price_cents: 6999,  image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400" },
  { id: "tp-trophy",    title: "Custom Engraved Trophy",   category: "Award",     price_cents: 4999,  image_url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=400" },
];

export const TAX_RATE = 0.08;
export const SHIPPING_FLAT_CENTS = 1200;
export const NP_DONATION_RATE = 0.10;

export function calcCampaignFinancials(players) {
  const totalPrizeCents = players.reduce((sum, p) => {
    const prize = p.selected_prize_snapshot;
    return sum + (prize ? prize.price_cents : 0);
  }, 0);
  const totalTax = Math.round(totalPrizeCents * TAX_RATE);
  const totalShipping = players.filter(p => p.selected_prize_snapshot).length * SHIPPING_FLAT_CENTS;
  const subtotal = totalPrizeCents + totalTax + totalShipping;
  const donation = Math.round(subtotal * NP_DONATION_RATE);
  const total = subtotal + donation;
  return { totalPrizeCents, totalTax, totalShipping, donation, total };
}

export function formatCents(cents) {
  return "$" + (cents / 100).toFixed(2);
}