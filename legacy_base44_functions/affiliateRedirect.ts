import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json().catch(() => ({}));
  const { offerId, sourcePage } = body;

  if (!offerId) {
    return Response.json({ error: 'offerId required' }, { status: 400 });
  }

  // Fetch the offer
  const offers = await base44.asServiceRole.entities.AffiliateOffer.filter({ id: offerId });
  if (!offers || offers.length === 0) {
    return Response.json({ error: 'Offer not found' }, { status: 404 });
  }
  const offer = offers[0];

  if (!offer.active) {
    return Response.json({ error: 'Offer is no longer active' }, { status: 410 });
  }

  // Log the click
  let userId = null;
  try {
    const user = await base44.auth.me();
    userId = user?.id || null;
  } catch (_) { /* anonymous visitor */ }

  await base44.asServiceRole.entities.AffiliateClick.create({
    offer_id: offer.id,
    offer_title: offer.title,
    merchant: offer.merchant,
    affiliate_url: offer.affiliate_url,
    user_id: userId,
    source_page: sourcePage || 'unknown',
  });

  return Response.json({
    affiliate_url: offer.affiliate_url,
    merchant: offer.merchant,
    title: offer.title,
    disclosure_text: offer.disclosure_text || `Paid link — we may earn a commission if you purchase through this link. This supports the platform and The North Pole Fund.`,
  });
});