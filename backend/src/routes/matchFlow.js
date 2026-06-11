import express from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { getRequestUser, ROLES } from '../lib/auth.js';
import { searchProductsAcrossProviders, searchEbayBrowseCleanResults } from '../lib/searchProviders/products.js';
import { searchGamesAcrossProviders } from '../lib/searchProviders/games.js';
import { FulfillmentEngine } from '../services/fulfillment/FulfillmentEngine.js';
import { WinnerVerificationEngine } from '../services/WinnerVerificationEngine.js';

const ADMIN_ROLES = new Set([ROLES.OWNER, ROLES.ADMIN]);
const SIMULATED_PROVIDER = 'simulated';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const ok = (res, data = {}) => res.json({ success: true, ...data });
const now = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}_${crypto.randomUUID()}`;

const scoreTypes = ['highest_score', 'lowest_time', 'bracket_result', 'manual_review', 'manual'];
const fulfillmentStatuses = [
  'pending_address',
  'ready_to_order',
  'ordered',
  'shipped',
  'delivered',
  'cancelled',
  'pending_verification',
  'pending_admin_approval',
];
const cancellableMatchStatuses = new Set(['draft', 'open', 'waiting_for_players']);
const verificationStatuses = ['pending', 'verified', 'rejected', 'disputed'];
const aiReviewStatuses = ['not_reviewed', 'clean', 'suspicious', 'flagged'];
const refereeAccountTypes = ['ai_referee', 'human_referee', 'game_api_referee'];
const refereeAccountStatuses = ['available', 'assigned', 'offline', 'disabled'];
const refereeSupportedModes = ['manual_evidence', 'vision_review', 'game_api', 'spectator_bot', 'native_game_sdk'];
const refereeSessionStatuses = ['assigned', 'observing', 'report_submitted', 'failed', 'cancelled'];
const refereeJoinMethods = ['spectator_mode', 'private_lobby', 'game_api', 'stream_review', 'evidence_review', 'native_game_sdk'];
const refereeReportSources = ['game_api', 'spectator_bot', 'native_game_sdk', 'vision_review', 'stream_review', 'manual_evidence', 'player_evidence'];
const autoLockRefereeSources = new Set(['game_api', 'spectator_bot', 'native_game_sdk']);
const adminReviewRefereeSources = new Set(['vision_review', 'stream_review', 'manual_evidence', 'player_evidence']);
const PILOT_TAX_RATE = 0.0825;
const DEFAULT_SHIPPING_CENTS = 599;
const FULFILLMENT_RESERVE_CENTS = 300;
const DEFAULT_PLATFORM_OR_FOUNDATION_AMOUNT_CENTS = 500;
const DEFAULT_FOUNDATION_RATE = 0.10;
const PAYMENT_PROCESSING_RATE = 0.03;
const PAYMENT_PROCESSING_PER_PLAYER_CENTS = 30;
const PRIZE_ROOM_STATUSES = [
  'draft',
  'open',
  'awaiting_contributions',
  'funded',
  'in_progress',
  'pending_verification',
  'winner_verified',
  'fulfillment_pending',
  'prize_fulfillment',
  'fulfilled',
  'cancelled',
];
const APPROVED_WINNER_VERIFICATION_STATUSES = new Set(['approved']);

const PRIZE_CATALOG_ROWS = [
  { id: 'electronics', title: 'Popular Electronics', category: 'Electronics', query_terms: ['wireless earbuds', 'bluetooth speaker', 'portable charger', 'smart watch', 'tablet stand'] },
  { id: 'gaming_gear', title: 'Gaming Gear', category: 'Gaming Gear', query_terms: ['gaming headset', 'wireless controller', 'gaming keyboard', 'gaming mouse', 'controller charging dock'] },
  { id: 'toys_family', title: 'Toys & Family Prizes', category: 'Toys', query_terms: ['LEGO set', 'RC car', 'drone toy', 'kids science kit', 'building blocks'] },
  { id: 'sports_outdoor', title: 'Sports & Outdoor', category: 'Sports / Outdoor', query_terms: ['basketball', 'soccer ball', 'bike helmet', 'skateboard', 'insulated water bottle'] },
  { id: 'style_clothing', title: 'Style & Clothing', category: 'Clothing', query_terms: ['hoodie', 'graphic t shirt', 'baseball cap', 'backpack'] },
  { id: 'shoes', title: 'Shoes', category: 'Shoes', query_terms: ['running shoes', 'sneakers', 'slides'] },
  { id: 'home_desk', title: 'Home & Desk', category: 'Home', query_terms: ['throw blanket', 'desk organizer', 'LED desk lamp', 'wall clock'] },
  { id: 'art_creative', title: 'Art & Creative', category: 'Art / Creative', query_terms: ['art supply kit', 'sketchbook', 'markers', 'colored pencils', 'paint set'] },
  { id: 'books_education', title: 'Books & Education', category: 'Books / Education', query_terms: ['children book set', 'workbook', 'science kit', 'chess book'] },
  { id: 'collectibles', title: 'Collectibles', category: 'Collectibles', query_terms: ['trading cards', 'action figure', 'comic book', 'collectible figure'] },
];

const UNSAFE_PRIZE_TERMS = /\b(adult|alcohol|beer|wine|liquor|whiskey|vodka|tobacco|cigar|cigarette|nicotine|vape|weapon|knife|knives|gun|firearm|ammo|ammunition|cbd|thc|hemp|supplement|diet pill|weight loss|gambling|lottery|mystery box|used underwear)\b/i;
const BAD_CONDITION_TERMS = /\b(broken|for parts|not working|untested|as-is|as is|salvage|repair only|parts only)\b/i;
const REPLACEMENT_PART_TERMS = /\b(replacement|spare|repair|part only|parts only|shell only|case only|cover only|charger cable only|manual only)\b/i;
const ACCESSORY_PART_TERMS = /\b(cable|adapter|skin|sticker|sleeve|protector|replacement|spare|case only|cover only|strap only|screen protector)\b/i;

const joinSchema = z.object({
  entryAmount: z.number().int().nonnegative().optional(),
  entry_amount: z.number().int().nonnegative().optional(),
  currency: z.string().min(3).max(8).optional(),
}).passthrough();

const submitScoreSchema = z.object({
  userId: z.string().min(1).optional(),
  user_id: z.string().min(1).optional(),
  score: z.union([z.number(), z.string()]),
  scoreType: z.enum(scoreTypes).optional(),
  score_type: z.enum(scoreTypes).optional(),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  evidence_url: z.string().url().optional().or(z.literal('')),
  evidenceNotes: z.string().max(4000).optional(),
  evidence_notes: z.string().max(4000).optional(),
  platformUsername: z.string().max(200).optional(),
  platform_username: z.string().max(200).optional(),
  matchRound: z.string().max(120).optional(),
  match_round: z.string().max(120).optional(),
  metadata: z.record(z.unknown()).optional(),
}).passthrough();

const reviewScoreSchema = z.object({
  scoreId: z.string().min(1).optional(),
  score_id: z.string().min(1).optional(),
  verificationStatus: z.enum(verificationStatuses).optional(),
  verification_status: z.enum(verificationStatuses).optional(),
  aiReviewStatus: z.enum(aiReviewStatuses).optional(),
  ai_review_status: z.enum(aiReviewStatuses).optional(),
  reviewNotes: z.string().max(4000).optional(),
  review_notes: z.string().max(4000).optional(),
  reviewedBy: z.string().max(200).optional(),
  reviewed_by: z.string().max(200).optional(),
}).passthrough();

const lockWinnerSchema = z.object({
  winnerUserId: z.string().min(1).optional(),
  winner_user_id: z.string().min(1).optional(),
  winningScore: z.number().optional(),
  winning_score: z.number().optional(),
  verificationMethod: z.enum(['automatic', 'ai_assisted', 'admin_review']).optional(),
  verification_method: z.enum(['automatic', 'ai_assisted', 'admin_review']).optional(),
  auditNotes: z.string().max(4000).optional(),
  audit_notes: z.string().max(4000).optional(),
  lockedBy: z.string().max(200).optional(),
  locked_by: z.string().max(200).optional(),
  adminOverride: z.boolean().optional(),
  admin_override: z.boolean().optional(),
}).passthrough();

const disputeWinnerSchema = z.object({
  userId: z.string().min(1).optional(),
  user_id: z.string().min(1).optional(),
  reason: z.string().min(1).max(4000),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  evidence_url: z.string().url().optional().or(z.literal('')),
}).passthrough();

const adminOverrideWinnerSchema = z.object({
  adminUserId: z.string().min(1).optional(),
  admin_user_id: z.string().min(1).optional(),
  newWinnerUserId: z.string().min(1).optional(),
  new_winner_user_id: z.string().min(1).optional(),
  reason: z.string().min(1).max(4000),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  evidence_url: z.string().url().optional().or(z.literal('')),
}).passthrough();

const demoFulfillmentOrderSchema = z.object({
  matchId: z.string().min(1).optional(),
  match_id: z.string().min(1).optional(),
}).passthrough();

const prizeRoomSnapshotSchema = z.record(z.unknown()).optional().nullable();

const calculatePrizeRoomCheckoutSchema = z.object({
  prizeSnapshot: prizeRoomSnapshotSchema,
  prize_snapshot: prizeRoomSnapshotSchema,
  playerCount: z.number().int().min(2).max(100).optional(),
  player_count: z.number().int().min(2).max(100).optional(),
  maxPlayers: z.number().int().min(2).max(100).optional(),
  max_players: z.number().int().min(2).max(100).optional(),
  foundationRate: z.number().min(0).max(1).optional(),
  foundation_rate: z.number().min(0).max(1).optional(),
}).passthrough();

const createPrizeRoomSchema = z.object({
  templateId: z.string().min(1).optional(),
  template_id: z.string().min(1).optional(),
  roomType: z.enum(['platform_supported', 'user_created', 'template_based']).optional(),
  room_type: z.enum(['platform_supported', 'user_created', 'template_based']).optional(),
  title: z.string().min(1).max(240).optional(),
  description: z.string().max(1200).optional(),
  gameId: z.string().min(1).optional(),
  game_id: z.string().min(1).optional(),
  gameTitle: z.string().max(240).optional(),
  game_title: z.string().max(240).optional(),
  gameImage: z.string().max(1000).optional(),
  game_image: z.string().max(1000).optional(),
  gamePlatform: z.string().max(120).optional(),
  game_platform: z.string().max(120).optional(),
  prizeId: z.string().min(1).optional(),
  prize_id: z.string().min(1).optional(),
  prizeTitle: z.string().max(300).optional(),
  prize_title: z.string().max(300).optional(),
  prizeImage: z.string().max(1000).optional(),
  prize_image: z.string().max(1000).optional(),
  prizeSource: z.string().max(120).optional(),
  prize_source: z.string().max(120).optional(),
  prizeUrl: z.string().url().optional().or(z.literal('')),
  prize_url: z.string().url().optional().or(z.literal('')),
  prizeSnapshot: prizeRoomSnapshotSchema,
  prize_snapshot: prizeRoomSnapshotSchema,
  minPlayers: z.number().int().min(1).max(100).optional(),
  min_players: z.number().int().min(1).max(100).optional(),
  maxPlayers: z.number().int().min(2).max(100).optional(),
  max_players: z.number().int().min(2).max(100).optional(),
  winningRule: z.string().max(240).optional(),
  winning_rule: z.string().max(240).optional(),
  verificationMethod: z.string().max(120).optional(),
  verification_method: z.string().max(120).optional(),
  foundationRate: z.number().min(0).max(1).optional(),
  foundation_rate: z.number().min(0).max(1).optional(),
  paymentMode: z.enum(['pilot_manual', 'stripe_test', 'stripe_live']).optional(),
  payment_mode: z.enum(['pilot_manual', 'stripe_test', 'stripe_live']).optional(),
}).passthrough();

const joinPrizeRoomSchema = z.object({
  displayName: z.string().max(160).optional(),
  display_name: z.string().max(160).optional(),
  userEmail: z.string().email().optional().or(z.literal('')),
  user_email: z.string().email().optional().or(z.literal('')),
  paymentMode: z.enum(['pilot_manual', 'stripe_test', 'stripe_live']).optional(),
  payment_mode: z.enum(['pilot_manual', 'stripe_test', 'stripe_live']).optional(),
}).passthrough();

const markContributionPaidSchema = z.object({
  contributionId: z.string().min(1).optional(),
  contribution_id: z.string().min(1).optional(),
}).passthrough();

const assignRefereeSchema = z.object({
  refereeAccountId: z.string().min(1).optional(),
  referee_account_id: z.string().min(1).optional(),
  joinMethod: z.enum(refereeJoinMethods).optional(),
  join_method: z.enum(refereeJoinMethods).optional(),
  externalLobbyId: z.string().max(300).optional(),
  external_lobby_id: z.string().max(300).optional(),
  streamUrl: z.string().url().optional().or(z.literal('')),
  stream_url: z.string().url().optional().or(z.literal('')),
}).passthrough();

const startRefereeSessionSchema = z.object({
  refereeSessionId: z.string().min(1).optional(),
  referee_session_id: z.string().min(1).optional(),
}).passthrough();

const refereeReportSchema = z.object({
  refereeSessionId: z.string().min(1).optional(),
  referee_session_id: z.string().min(1).optional(),
  source: z.enum(refereeReportSources),
  providerName: z.string().max(200).optional(),
  provider_name: z.string().max(200).optional(),
  winnerUserId: z.string().min(1).optional(),
  winner_user_id: z.string().min(1).optional(),
  loserUserIds: z.array(z.string()).optional(),
  loser_user_ids: z.array(z.string()).optional(),
  winningScore: z.union([z.number(), z.string()]).optional(),
  winning_score: z.union([z.number(), z.string()]).optional(),
  scoreType: z.enum(scoreTypes).optional(),
  score_type: z.enum(scoreTypes).optional(),
  confidence: z.union([z.number(), z.string()]).optional(),
  evidenceUrls: z.array(z.string()).optional(),
  evidence_urls: z.array(z.string()).optional(),
  rawReport: z.unknown().optional(),
  raw_report: z.unknown().optional(),
  warnings: z.array(z.string()).optional(),
  signedPayload: z.string().optional(),
  signed_payload: z.string().optional(),
  reportStatus: z.enum(['pending', 'accepted', 'rejected', 'disputed']).optional(),
  report_status: z.enum(['pending', 'accepted', 'rejected', 'disputed']).optional(),
}).passthrough();

const updateFulfillmentStatusSchema = z.object({
  status: z.enum(fulfillmentStatuses).optional(),
  shippingStatus: z.enum(fulfillmentStatuses).optional(),
  shipping_status: z.enum(fulfillmentStatuses).optional(),
  adminApproved: z.boolean().optional(),
  admin_approved: z.boolean().optional(),
  winnerName: z.string().max(240).optional(),
  winner_name: z.string().max(240).optional(),
  winnerEmail: z.string().email().optional().or(z.literal('')),
  winner_email: z.string().email().optional().or(z.literal('')),
  prizeTitle: z.string().max(300).optional(),
  prize_title: z.string().max(300).optional(),
  prizeSource: z.string().max(120).optional(),
  prize_source: z.string().max(120).optional(),
  prizeUrl: z.string().url().optional().or(z.literal('')),
  prize_url: z.string().url().optional().or(z.literal('')),
  prizeImage: z.string().url().optional().or(z.literal('')),
  prize_image: z.string().url().optional().or(z.literal('')),
  shippingName: z.string().max(240).optional(),
  shipping_name: z.string().max(240).optional(),
  shippingAddressLine1: z.string().max(300).optional(),
  shipping_address_line1: z.string().max(300).optional(),
  shippingAddressLine2: z.string().max(300).optional(),
  shipping_address_line2: z.string().max(300).optional(),
  shippingCity: z.string().max(160).optional(),
  shipping_city: z.string().max(160).optional(),
  shippingState: z.string().max(120).optional(),
  shipping_state: z.string().max(120).optional(),
  shippingZip: z.string().max(40).optional(),
  shipping_zip: z.string().max(40).optional(),
  shippingCountry: z.string().max(120).optional(),
  shipping_country: z.string().max(120).optional(),
  retailerOrderId: z.string().max(160).optional(),
  retailer_order_id: z.string().max(160).optional(),
  trackingNumber: z.string().max(120).optional(),
  tracking_number: z.string().max(120).optional(),
  adminNotes: z.string().max(8000).optional(),
  admin_notes: z.string().max(8000).optional(),
  carrier: z.string().max(120).optional(),
}).passthrough();

function isAdmin(user) {
  return ADMIN_ROLES.has(user?.role);
}

function matchUserIds(user) {
  return [user?.id, user?.auth_user_id, user?.authUserId, user?.user_id].filter(Boolean).map(String);
}

function isMatchCreator(match, user) {
  const userIds = matchUserIds(user);
  return [match?.creator_user_id, match?.created_by].filter(Boolean).map(String).some((id) => userIds.includes(id));
}

async function requireUser(req, res, store) {
  const user = await getRequestUser(req, store);
  if (!user?.id) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  return user;
}

async function findMatch(store, matchId) {
  return await store.findOne('north_pole_matches', { id: matchId })
    || await store.findOne('north_pole_matches', { match_id: matchId })
    || await store.findOne('user_matches', { id: matchId })
    || await store.findOne('matches', { id: matchId });
}

function publicMatchId(match) {
  return match?.match_id || match?.id;
}

function matchRowId(match) {
  return match?.id;
}

function isSimulatedMatch(match) {
  return match?.sandbox_mode === true
    || match?.sandboxMode === true
    || String(match?.paymentProvider || match?.payment_provider || '').toLowerCase() === SIMULATED_PROVIDER
    || String(match?.mode || '').toLowerCase() === 'test';
}

async function createAuditEvent(store, {
  entityType,
  entityId,
  matchId,
  userId,
  action,
  metadata = {},
}) {
  return store.create('audit_events', {
    actor: userId ? `user:${userId}` : 'system',
    stage: action,
    message: action,
    meta: {
      entityType,
      entityId,
      matchId,
      userId,
      action,
      metadata,
    },
  });
}

function normalizePrize(match) {
  const snapshot = match?.prize_snapshot || match?.product_offer || {};
  const bestOffer = Array.isArray(snapshot.offers) ? snapshot.offers[0] || {} : {};
  const productSource = String(snapshot.source || snapshot.provider || bestOffer.retailer || 'manual').toLowerCase().includes('ebay')
    ? 'ebay'
    : String(snapshot.source || '').toLowerCase().includes('amazon')
      ? 'amazon'
      : 'manual';

  return {
    prizeId: match?.prize_id || match?.product_id || snapshot.id || null,
    productSource,
    productUrl: snapshot.product_url || snapshot.source_url || snapshot.url || bestOffer.product_url || null,
    image: snapshot.image || snapshot.image_url || snapshot.thumbnail || snapshot.thumbnail_url || bestOffer.image || '',
    itemId: snapshot.item_id || snapshot.itemId || snapshot.id || match?.prize_id || null,
    title: snapshot.title || 'Selected prize',
    price: Number(snapshot.price_cents || snapshot.price || bestOffer.price_cents || 0),
    currency: snapshot.currency || bestOffer.currency || 'USD',
    shippingCost: Number(snapshot.estimated_shipping_cents || snapshot.shipping_estimate_cents || snapshot.shippingCost || 0),
    taxCost: Number(snapshot.estimated_tax_cents || snapshot.tax_cents || snapshot.sales_tax_cents || bestOffer.estimated_tax_cents || 0),
  };
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function normalizeCents(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : fallback;
}

function buildPrizeCostBreakdown(match, env = process.env) {
  const snapshot = match?.prize_snapshot || match?.product_offer || {};
  const bestOffer = Array.isArray(snapshot.offers) ? snapshot.offers[0] || {} : {};
  const itemCostCents = normalizeCents(firstFiniteNumber(
    snapshot.item_cost_cents,
    snapshot.price_cents,
    bestOffer.price_cents,
    match?.match_plan?.priceCents,
    match?.match_plan?.prizeCostCents,
    match?.total_prize_path_cents,
    snapshot.price,
    bestOffer.price,
  ), 0);
  const snapshotTax = firstFiniteNumber(
    snapshot.estimated_tax_cents,
    snapshot.tax_cents,
    snapshot.sales_tax_cents,
    bestOffer.estimated_tax_cents,
    bestOffer.tax_cents,
  );
  const shippingEstimate = firstFiniteNumber(
    snapshot.estimated_shipping_cents,
    snapshot.shipping_estimate_cents,
    snapshot.shipping_cost_cents,
    snapshot.shippingCost,
    bestOffer.estimated_shipping_cents,
    bestOffer.shipping_estimate_cents,
    bestOffer.shipping_cost_cents,
  );
  const platformAmount = firstFiniteNumber(
    match?.platform_or_foundation_amount_cents,
    match?.match_plan?.platformOrFoundationAmountCents,
    match?.match_plan?.foundationAmountCents,
    snapshot.platform_or_foundation_amount_cents,
    snapshot.foundation_amount_cents,
    env.PILOT_PLATFORM_OR_FOUNDATION_AMOUNT_CENTS,
  );
  const estimatedTaxCents = normalizeCents(snapshotTax ?? itemCostCents * PILOT_TAX_RATE);
  const estimatedShippingCents = normalizeCents(shippingEstimate ?? DEFAULT_SHIPPING_CENTS);
  const fulfillmentReserveCents = FULFILLMENT_RESERVE_CENTS;
  const platformOrFoundationAmountCents = normalizeCents(platformAmount ?? DEFAULT_PLATFORM_OR_FOUNDATION_AMOUNT_CENTS);
  const totalRequiredCents = itemCostCents
    + estimatedTaxCents
    + estimatedShippingCents
    + fulfillmentReserveCents
    + platformOrFoundationAmountCents;

  return {
    item_cost_cents: itemCostCents,
    estimated_tax_cents: estimatedTaxCents,
    estimated_shipping_cents: estimatedShippingCents,
    fulfillment_reserve_cents: fulfillmentReserveCents,
    platform_or_foundation_amount_cents: platformOrFoundationAmountCents,
    total_required_cents: totalRequiredCents,
    estimate_label: 'Pilot estimate',
    purchase_automation_status: 'No real purchase made automatically',
    fulfillment_requirement: 'Manual purchase required',
    tax_basis: snapshotTax === null ? '8.25% pilot estimate' : 'prize snapshot tax',
    shipping_basis: shippingEstimate === null ? '$5.99 pilot estimate' : 'prize snapshot shipping estimate',
    currency: snapshot.currency || bestOffer.currency || 'USD',
  };
}

function buildPrizeRoomCostBreakdown({ prizeSnapshot = {}, playerCount = 2, foundationRate = DEFAULT_FOUNDATION_RATE, env = process.env } = {}) {
  const snapshot = prizeSnapshot && typeof prizeSnapshot === 'object' ? prizeSnapshot : {};
  const bestOffer = Array.isArray(snapshot.offers) ? snapshot.offers[0] || {} : {};
  const players = Math.max(2, normalizeCents(playerCount, 2));
  const itemCostCents = normalizeCents(firstFiniteNumber(
    snapshot.item_cost_cents,
    snapshot.price_cents,
    bestOffer.price_cents,
    snapshot.price,
    bestOffer.price,
  ), 0);
  const snapshotTax = firstFiniteNumber(
    snapshot.estimated_tax_cents,
    snapshot.tax_cents,
    snapshot.sales_tax_cents,
    bestOffer.estimated_tax_cents,
    bestOffer.tax_cents,
  );
  const snapshotShipping = firstFiniteNumber(
    snapshot.estimated_shipping_cents,
    snapshot.shipping_estimate_cents,
    snapshot.shipping_cost_cents,
    snapshot.shippingCost,
    bestOffer.estimated_shipping_cents,
    bestOffer.shipping_estimate_cents,
    bestOffer.shipping_cost_cents,
  );
  const configuredFoundationRate = firstFiniteNumber(foundationRate, env.PRIZE_ROOM_FOUNDATION_RATE, DEFAULT_FOUNDATION_RATE);
  const safeFoundationRate = Number.isFinite(configuredFoundationRate) ? Math.min(1, Math.max(0, configuredFoundationRate)) : DEFAULT_FOUNDATION_RATE;
  const estimatedTaxCents = normalizeCents(snapshotTax ?? itemCostCents * PILOT_TAX_RATE);
  const estimatedShippingCents = normalizeCents(snapshotShipping ?? DEFAULT_SHIPPING_CENTS);
  const fulfillmentReserveCents = normalizeCents(env.PRIZE_ROOM_FULFILLMENT_RESERVE_CENTS ?? FULFILLMENT_RESERVE_CENTS, FULFILLMENT_RESERVE_CENTS);
  const prizeSubtotalCents = itemCostCents + estimatedTaxCents + estimatedShippingCents;
  const processingBaseCents = prizeSubtotalCents + fulfillmentReserveCents;
  const paymentProcessingReserveCents = normalizeCents(
    processingBaseCents * PAYMENT_PROCESSING_RATE + players * PAYMENT_PROCESSING_PER_PLAYER_CENTS,
  );
  const foundationAmountCents = normalizeCents(prizeSubtotalCents * safeFoundationRate);
  const totalRoomCostCents = prizeSubtotalCents
    + fulfillmentReserveCents
    + paymentProcessingReserveCents
    + foundationAmountCents;

  return {
    item_cost_cents: itemCostCents,
    estimated_tax_cents: estimatedTaxCents,
    estimated_shipping_cents: estimatedShippingCents,
    fulfillment_reserve_cents: fulfillmentReserveCents,
    payment_processing_reserve_cents: paymentProcessingReserveCents,
    foundation_rate: safeFoundationRate,
    foundation_amount_cents: foundationAmountCents,
    total_room_cost_cents: totalRoomCostCents,
    per_player_contribution_cents: normalizeCents(Math.ceil(totalRoomCostCents / players)),
    currency: snapshot.currency || bestOffer.currency || 'USD',
    estimate_label: 'Test Mode estimate',
    payment_mode_label: 'Test Mode: no real charge made',
    purchase_automation_status: 'No real purchase made automatically',
    fulfillment_requirement: 'Manual purchase required',
    prepared_fulfillment_label: 'Prepared order only',
  };
}

function normalizeLookupText(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function slugifyRoomImageName(value = '') {
  return normalizeLookupText(value).replace(/\s+/g, '-');
}

function defaultGameImage(gameTitle = '') {
  const title = normalizeLookupText(gameTitle);
  if (title.includes('mario')) return '/images/prize-rooms/games/mario-kart.svg';
  if (title.includes('madden')) return '/images/prize-rooms/games/madden.svg';
  if (title.includes('nba') || title.includes('2k')) return '/images/prize-rooms/games/nba-2k.svg';
  if (title.includes('call of duty') || title.includes('cod')) return '/images/prize-rooms/games/call-of-duty.svg';
  if (title.includes('rocket')) return '/images/prize-rooms/games/rocket-league.svg';
  if (title.includes('uno')) return '/images/prize-rooms/games/uno.svg';
  if (title.includes('chess')) return '/images/prize-rooms/games/chess.svg';
  if (title.includes('fortnite')) return '/images/prize-rooms/games/fortnite.svg';
  if (title.includes('mortal')) return '/images/prize-rooms/games/mortal-kombat.svg';
  return '/images/prize-rooms/games/family-game-night.svg';
}

function defaultPrizeImage(prizeTitle = '') {
  const title = normalizeLookupText(prizeTitle);
  if (title.includes('nintendo')) return '/images/prize-rooms/prizes/nintendo-gift-card.svg';
  if (title.includes('gamestop') || title.includes('game stop')) return '/images/prize-rooms/prizes/gamestop-gift-card.svg';
  if (title.includes('playstation')) return '/images/prize-rooms/prizes/playstation-store-gift-card.svg';
  if (title.includes('xbox')) return '/images/prize-rooms/prizes/xbox-gift-card.svg';
  if (title.includes('rocket')) return '/images/prize-rooms/prizes/rocket-league-credits.svg';
  if (title.includes('family') && title.includes('gift card')) return '/images/prize-rooms/prizes/family-game-night-gift-card.svg';
  if (title.includes('v bucks') || title.includes('vbucks') || title.includes('fortnite')) return '/images/prize-rooms/prizes/vbucks-gift-card.svg';
  if (title.includes('amazon') || title.includes('book')) return '/images/prize-rooms/prizes/amazon-gift-card.svg';
  if (title.includes('console') || title.includes('store')) return '/images/prize-rooms/prizes/console-store-gift-card.svg';
  if (title.includes('mystery') || title.includes('family')) return '/images/prize-rooms/prizes/mystery-family-prize.svg';
  const slug = slugifyRoomImageName(prizeTitle);
  if (slug) return `/images/prize-rooms/prizes/${slug}.svg`;
  return '/images/prize-rooms/prizes/mystery-family-prize.svg';
}

function firstImageUrl(source, fields = []) {
  if (!source || typeof source !== 'object') return '';
  for (const field of fields) {
    const value = source[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object' && typeof value.imageUrl === 'string' && value.imageUrl.trim()) {
      return value.imageUrl.trim();
    }
    if (value && typeof value === 'object' && typeof value.url === 'string' && value.url.trim()) {
      return value.url.trim();
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === 'string' && entry.trim()) return entry.trim();
        if (entry && typeof entry === 'object' && typeof entry.imageUrl === 'string' && entry.imageUrl.trim()) {
          return entry.imageUrl.trim();
        }
        if (entry && typeof entry === 'object' && typeof entry.image === 'string' && entry.image.trim()) {
          return entry.image.trim();
        }
        if (entry && typeof entry === 'object' && typeof entry.url === 'string' && entry.url.trim()) {
          return entry.url.trim();
        }
      }
    }
  }
  return '';
}

function prizeImageFromSnapshot(source) {
  return firstImageUrl(source, [
    'image',
    'image_url',
    'thumbnailImages',
    'thumbnail',
    'thumbnail_url',
    'galleryURL',
    'pictureURLLarge',
    'pictureURLSuperSize',
    'additionalImages',
  ]);
}

function productImageFromSnapshot(source = {}) {
  return firstImageUrl(source, [
    'image_url',
    'image',
    'imageUrl',
    'images',
    'image_urls',
    'thumbnailImages',
    'additionalImages',
    'galleryURL',
    'pictureURLLarge',
    'pictureURLSuperSize',
  ]);
}

function gameImageFromSnapshot(source) {
  return firstImageUrl(source, [
    'background_image',
    'background_image_additional',
    'image',
    'icon_url',
    'cover',
    'thumbnail',
    'short_screenshots',
  ]);
}

function extractEbayImage(item = {}) {
  return item?.image_url
    || item?.imageUrl
    || item?.images?.[0]
    || item?.raw_ebay?.imageUrl
    || item?.image?.imageUrl
    || item?.thumbnailImages?.[0]?.imageUrl
    || item?.additionalImages?.[0]?.imageUrl
    || '';
}

function extractRawgGameImage(game = {}) {
  return game?.background_image
    || game?.background_image_additional
    || game?.short_screenshots?.[0]?.image
    || game?.image
    || game?.image_url
    || game?.icon_url
    || game?.cover
    || game?.thumbnail
    || '';
}

function isPrizeRoomFallbackImage(value = '') {
  return typeof value === 'string' && value.startsWith('/images/prize-rooms/');
}

function isExternalEbayImage(value = '') {
  return typeof value === 'string' && /^https?:\/\/i\.ebayimg\.com\//i.test(value);
}

function isHttpsImage(value = '') {
  return typeof value === 'string' && value.startsWith('https://');
}

function isExternalRawgImage(value = '') {
  return typeof value === 'string' && /^https?:\/\/media\.rawg\.io\//i.test(value);
}

const TRUSTED_PRIZE_ROOM_IMAGE_HOSTS = new Set(['i.ebayimg.com', 'media.rawg.io']);

function trustedPrizeRoomImageUrl(value = '') {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'https:') return '';
    if (!TRUSTED_PRIZE_ROOM_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function prizeRoomPrizeImageForProxy(room = {}) {
  return trustedPrizeRoomImageUrl(room.prize_image)
    || trustedPrizeRoomImageUrl(room.prize_snapshot?.image)
    || trustedPrizeRoomImageUrl(room.prize_snapshot?.image_url)
    || '';
}

function prizeRoomGameImageForProxy(room = {}) {
  return trustedPrizeRoomImageUrl(room.game_image)
    || trustedPrizeRoomImageUrl(room.game_snapshot?.background_image)
    || trustedPrizeRoomImageUrl(room.game_snapshot?.image)
    || trustedPrizeRoomImageUrl(room.game_snapshot?.image_url)
    || '';
}

async function proxyPrizeRoomImage(res, imageUrl) {
  const trustedUrl = trustedPrizeRoomImageUrl(imageUrl);
  if (!trustedUrl) return res.status(404).json({ success: false, error: 'Image not found' });

  const upstream = await fetch(trustedUrl);
  const contentType = upstream.headers.get('content-type') || '';
  if (!upstream.ok || !contentType.toLowerCase().startsWith('image/')) {
    return res.status(404).json({ success: false, error: 'Image not found' });
  }

  const bytes = Buffer.from(await upstream.arrayBuffer());
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Type', contentType);
  return res.status(200).send(bytes);
}

function productMarketplaceKey(product = {}) {
  return product.provider_ids?.ebay_item_id
    || product.raw_ebay?.itemId
    || product.id
    || product.product_url
    || product.title
    || '';
}

function normalizedPrizeTitle(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizedPrizeTitleForDedupe(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

function productConditionText(product = {}) {
  return String(product.condition
    || product.raw_product?.condition
    || product.raw_product?.raw_ebay?.condition
    || product.raw_ebay?.condition
    || product.description
    || '').toLowerCase();
}

function productDedupKey(product = {}) {
  const priceCents = Number(product.price_cents || product.offers?.[0]?.price_cents || 0);
  return product.raw_ebay?.itemId
    || product.provider_ids?.ebay_item_id
    || product.itemId
    || product.marketplace_key
    || product.product_url
    || product.productUrl
    || product.offers?.[0]?.product_url
    || `${normalizedPrizeTitle(product.title || product.name).toLowerCase()}:${Math.round(priceCents || 0)}`;
}

function productDedupeKeys(product = {}) {
  const title = normalizedPrizeTitleForDedupe(product.title || product.name);
  const priceCents = Math.round(Number(product.price_cents || product.offers?.[0]?.price_cents || 0) || 0);
  const imageUrl = productImageFromSnapshot(product);
  return [
    product.raw_ebay?.itemId && `item:${product.raw_ebay.itemId}`,
    product.raw_product?.raw_ebay?.itemId && `item:${product.raw_product.raw_ebay.itemId}`,
    product.provider_ids?.ebay_item_id && `item:${product.provider_ids.ebay_item_id}`,
    product.itemId && `item:${product.itemId}`,
    product.marketplace_key && `marketplace:${product.marketplace_key}`,
    product.product_url && `url:${String(product.product_url).toLowerCase()}`,
    product.productUrl && `url:${String(product.productUrl).toLowerCase()}`,
    product.offers?.[0]?.product_url && `url:${String(product.offers[0].product_url).toLowerCase()}`,
    product.raw_ebay?.itemWebUrl && `url:${String(product.raw_ebay.itemWebUrl).toLowerCase()}`,
    product.raw_product?.raw_ebay?.itemWebUrl && `url:${String(product.raw_product.raw_ebay.itemWebUrl).toLowerCase()}`,
    title && `title:${title}`,
    title && priceCents ? `title_price:${title}:${priceCents}` : '',
    imageUrl && `image:${String(imageUrl).toLowerCase()}`,
  ].filter(Boolean);
}

function productTitleMatchesAnyQuery(product = {}, queryTerms = []) {
  const title = normalizedPrizeTitle(product.title || product.name).toLowerCase();
  return queryTerms.some((term) => {
    const words = String(term || '').toLowerCase().split(/\s+/).filter((word) => word.length > 2);
    return words.length && words.some((word) => title.includes(word));
  });
}

function productIsSafePrize(product = {}, row = {}) {
  const title = normalizedPrizeTitle(product.title || product.name);
  const condition = productConditionText(product);
  const category = String(product.category || row.category || '').toLowerCase();
  const searchable = `${title} ${product.description || ''} ${category} ${condition}`;
  const priceCents = Number(product.price_cents || product.offers?.[0]?.price_cents || 0);
  if (!productImageFromSnapshot(product)) return false;
  if (!priceCents || priceCents < 500 || priceCents > 50000) return false;
  if (UNSAFE_PRIZE_TERMS.test(searchable) || BAD_CONDITION_TERMS.test(searchable)) return false;
  if (!category.includes('tools') && REPLACEMENT_PART_TERMS.test(searchable)) return false;
  if (title.length > 180) return false;
  return true;
}

function productPrizeScore(product = {}, row = {}) {
  const title = normalizedPrizeTitle(product.title || product.name);
  const titleLower = title.toLowerCase();
  const condition = productConditionText(product);
  const priceCents = Number(product.price_cents || product.offers?.[0]?.price_cents || 0);
  const shipping = product.shipping_estimate_cents ?? product.raw_product?.shipping_estimate_cents ?? product.raw_product?.raw_ebay?.shippingCostValue;
  let score = 0;

  if (productImageFromSnapshot(product)) score += 30;
  if (priceCents >= 1500 && priceCents <= 15000) score += 28;
  else if (priceCents >= 500 && priceCents <= 30000) score += 14;
  if (/\b(new|brand new|open box)\b/i.test(condition)) score += 18;
  if (productTitleMatchesAnyQuery(product, row.query_terms || [])) score += 18;
  if (product.product_url || product.productUrl || product.offers?.[0]?.product_url) score += 8;
  if (shipping !== null && shipping !== undefined && shipping !== '') score += 8;
  if (product.category || row.category) score += 5;
  if (title.length > 120) score -= 10;
  if (/\b(refurbished|renewed|pre-owned|preowned)\b/i.test(condition)) score -= 10;
  if (BAD_CONDITION_TERMS.test(`${titleLower} ${condition}`)) score -= 50;
  if (/\b(bundle|lot of|random|assorted)\b/i.test(titleLower)) score -= 8;
  if (ACCESSORY_PART_TERMS.test(titleLower)) score -= 12;
  if (!product.category) score -= 6;

  return score;
}

function normalizeMarketplaceProduct(product = {}) {
  const image = productImageFromSnapshot(product);
  const title = product.title || product.name || 'Prize product';
  const priceCents = Number(product.price_cents || product.offers?.[0]?.price_cents || product.raw_ebay?.priceValue * 100 || 0);
  const source = product.source || product.provider || product.offers?.[0]?.source || 'catalog';
  const sourceLabel = product.source_label || product.sourceLabel || product.merchant || product.offers?.[0]?.source_label || source;
  const productUrl = product.product_url || product.productUrl || product.offers?.[0]?.product_url || product.raw_ebay?.itemWebUrl || '';
  const marketplaceKey = productMarketplaceKey(product);
  return {
    id: product.id || `product_${crypto.randomUUID()}`,
    marketplace_key: marketplaceKey,
    title,
    description: product.description || product.subtitle || product.raw_ebay?.condition || '',
    image_url: image,
    images: Array.isArray(product.images) && product.images.length ? product.images : [image].filter(Boolean),
    price_cents: Number.isFinite(priceCents) ? Math.max(0, Math.round(priceCents)) : 0,
    currency: product.currency || product.offers?.[0]?.currency || product.raw_ebay?.priceCurrency || 'USD',
    source,
    source_label: sourceLabel,
    seller: product.seller || product.merchant || product.brand || product.raw_ebay?.sellerUsername || sourceLabel,
    rating: product.rating ?? product.review_rating ?? null,
    category: product.category || 'Prize',
    product_url: productUrl,
    shipping_estimate_cents: product.shipping_estimate_cents || product.raw_ebay?.shippingCostValue * 100 || null,
    tax_estimate_cents: product.tax_estimate_cents || null,
    availability: product.availability || product.offers?.[0]?.availability || 'available',
    raw_product: product,
  };
}

function marketplaceProductFromEbayCleanResult(item = {}) {
  const priceNumber = Number.parseFloat(String(item.priceValue || ''));
  const shippingNumber = Number.parseFloat(String(item.shippingCostValue || ''));
  return normalizeMarketplaceProduct({
    id: item.itemId || `ebay_${crypto.randomUUID()}`,
    title: item.title || 'eBay item',
    image_url: item.imageUrl || '',
    images: item.imageUrl ? [item.imageUrl] : [],
    price_cents: Number.isFinite(priceNumber) ? Math.round(priceNumber * 100) : 0,
    currency: item.priceCurrency || 'USD',
    source: 'ebay_browse',
    source_label: 'eBay Browse API',
    provider: 'ebay_browse',
    seller: item.sellerUsername || 'eBay',
    description: item.condition || '',
    condition: item.condition || '',
    product_url: item.itemWebUrl || '',
    shipping_estimate_cents: Number.isFinite(shippingNumber) ? Math.round(shippingNumber * 100) : null,
    provider_ids: {
      ebay_item_id: item.itemId || '',
    },
    raw_ebay: item,
  });
}

async function persistMarketplaceProduct(store, product) {
  const normalized = normalizeMarketplaceProduct(product);
  const existing = normalized.marketplace_key
    ? await store.findOne('products', { marketplace_key: normalized.marketplace_key }).catch(() => null)
    : null;
  if (existing) return store.update('products', existing.id, { ...normalized, id: existing.id }).catch(() => ({ ...existing, ...normalized }));
  return store.create('products', normalized);
}

async function proxyMarketplaceProductImage(store, req, res) {
  const product = await store.findOne('products', { id: req.params.productId }).catch(() => null);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  return proxyPrizeRoomImage(res, productImageFromSnapshot(product));
}

const STARTER_PRIZE_ROOM_TEMPLATES = [
  ['madden-gift-card', 'Madden 1v1 Headset Room', 'Madden 1v1 skill match for a gaming headset prize.', 'Madden NFL', 'console', 'Gaming Headset', 4500, 2, 2, 'Highest score wins', 'Madden NFL', 'gaming headset'],
  ['nba-2k-gift-card', 'NBA 2K Controller Room', 'NBA 2K head-to-head room for a wireless controller prize.', 'NBA 2K', 'console', 'Wireless Game Controller', 4500, 2, 2, 'Highest score wins', 'NBA 2K', 'wireless game controller'],
  ['mario-kart-family', 'Mario Kart Switch Controller Room', 'Four-player family race night with a Nintendo Switch controller prize.', 'Mario Kart', 'switch', 'Nintendo Switch Controller', 4000, 2, 4, 'Best final race placement wins', 'Mario Kart', 'Nintendo Switch controller'],
  ['cod-kill-race', 'Call of Duty Earbuds Room', 'Skill-based kill race using submitted scoreboard proof for wireless earbuds.', 'Call of Duty', 'console/pc', 'Wireless Earbuds', 5000, 2, 4, 'Highest verified elimination count wins', 'Call of Duty', 'wireless earbuds'],
  ['rocket-league-2v2', 'Rocket League Soccer Ball Room', 'Team skill room for Rocket League players with a soccer ball prize.', 'Rocket League', 'multi-platform', 'Soccer Ball', 3000, 4, 4, 'Winning team by final score wins', 'Rocket League', 'soccer ball'],
  ['chess-match', 'Chess Set Prize Room', 'Classic chess match with PGN or screenshot proof for a chess set prize.', 'Chess', 'web/mobile', 'Chess Set', 3000, 2, 2, 'Checkmate or agreed final result wins', 'Chess', 'chess set'],
  ['uno-family', 'Uno Board Game Bundle Room', 'Family-friendly Uno room with a board game bundle prize.', 'Uno', 'tabletop/mobile', 'Board Game Bundle', 3500, 2, 4, 'First player out wins', 'Uno', 'board game bundle'],
  ['fortnite-creative', 'Fortnite Drone Toy Room', 'Creative challenge room with score/proof URL for a drone toy prize.', 'Fortnite Creative', 'multi-platform', 'Drone Toy', 4500, 2, 4, 'Highest challenge score wins', 'Fortnite', 'drone toy'],
  ['mortal-kombat-1v1', 'Mortal Kombat LEGO Set Room', 'Head-to-head fighting game prize room with a LEGO set prize.', 'Mortal Kombat', 'console/pc', 'LEGO Set', 4000, 2, 2, 'Best-of-three winner wins', 'Mortal Kombat', 'LEGO set'],
  ['family-mystery', 'Family Game Night Art Kit Room', 'Family game night room with an art supply kit prize.', 'Family Game Night', 'tabletop', 'Art Supply Kit', 3500, 2, 6, 'Manual family challenge winner wins', 'Family game night', 'art supply kit'],
].map(([id, title, description, gameTitle, gamePlatform, prizeTitle, priceCents, minPlayers, maxPlayers, winningRule, gameQuery, prizeQuery], index) => ({
  id: `tpl_${id}`,
  title,
  description,
  room_type: 'platform_supported',
  game_id: gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  game_title: gameTitle,
  game_query: gameQuery,
  game_image: defaultGameImage(gameTitle),
  game_platform: gamePlatform,
  prize_id: `starter_${id}`,
  prize_title: prizeTitle,
  prize_query: prizeQuery,
  prize_image: defaultPrizeImage(prizeTitle),
  prize_source: 'ebay_browse',
  prize_url: '',
  prize_snapshot: {
    id: `starter_${id}`,
    title: prizeTitle,
    image: defaultPrizeImage(prizeTitle),
    image_url: defaultPrizeImage(prizeTitle),
    source: 'ebay_browse',
    price_cents: priceCents,
    currency: 'USD',
    estimated_shipping_cents: DEFAULT_SHIPPING_CENTS,
  },
  max_players: maxPlayers,
  min_players: minPlayers,
  winning_rule: winningRule,
  verification_method: 'manual_score_with_proof',
  foundation_rate: DEFAULT_FOUNDATION_RATE,
  is_featured: index < 4,
  family_friendly: ['mario-kart-family', 'chess-match', 'uno-family', 'family-mystery'].some((slug) => id.includes(slug)),
  status: 'active',
}));

const STARTER_PRIZE_ROOM_TEMPLATE_BY_ID = new Map(STARTER_PRIZE_ROOM_TEMPLATES.map((template) => [template.id, template]));

async function ensureStarterPrizeRoomTemplates(store) {
  const created = [];
  for (const template of STARTER_PRIZE_ROOM_TEMPLATES) {
    const existing = await store.findOne('prize_room_templates', { id: template.id }).catch(() => null);
    if (existing) {
      const patch = {};
      for (const key of [
        'title',
        'description',
        'prize_title',
        'prize_query',
        'prize_source',
        'game_query',
        'winning_rule',
        'max_players',
        'min_players',
      ]) {
        if (existing[key] !== template[key]) patch[key] = template[key];
      }
      if (!existing.game_image) patch.game_image = template.game_image || defaultGameImage(existing.game_title || template.game_title);
      if (!existing.prize_image) patch.prize_image = template.prize_image || defaultPrizeImage(existing.prize_title || template.prize_title);
      if (existing.prize_snapshot && typeof existing.prize_snapshot === 'object' && existing.prize_snapshot.title !== template.prize_title && isPrizeRoomFallbackImage(existing.prize_image || existing.prize_snapshot.image || '')) {
        patch.prize_snapshot = {
          ...existing.prize_snapshot,
          title: template.prize_title,
          source: template.prize_source,
          image: patch.prize_image || existing.prize_image || template.prize_image,
          image_url: patch.prize_image || existing.prize_image || template.prize_image,
        };
      }
      if (existing.prize_snapshot && typeof existing.prize_snapshot === 'object' && (!existing.prize_snapshot.image && !existing.prize_snapshot.image_url)) {
        patch.prize_snapshot = {
          ...existing.prize_snapshot,
          image: patch.prize_image || existing.prize_image || template.prize_image,
          image_url: patch.prize_image || existing.prize_image || template.prize_image,
        };
      }
      if (Object.keys(patch).length) await store.update('prize_room_templates', existing.id, patch).catch(() => null);
      continue;
    }
    created.push(await store.create('prize_room_templates', template));
  }
  return created;
}

function prizeSnapshotFromRoomInput(input = {}, template = null) {
  const explicit = input.prizeSnapshot || input.prize_snapshot;
  if (explicit && typeof explicit === 'object') {
    const image = prizeImageFromSnapshot(explicit);
    return image ? { ...explicit, image, image_url: image } : explicit;
  }
  if (template?.prize_snapshot) return template.prize_snapshot;
  const prizeTitle = input.prizeTitle || input.prize_title || template?.prize_title || 'Pilot Prize';
  const prizeImage = input.prizeImage || input.prize_image || template?.prize_image || defaultPrizeImage(prizeTitle);
  return {
    id: input.prizeId || input.prize_id || template?.prize_id || `prize_${crypto.randomUUID()}`,
    title: prizeTitle,
    image: prizeImage,
    image_url: prizeImage,
    source: input.prizeSource || input.prize_source || template?.prize_source || 'manual',
    product_url: input.prizeUrl || input.prize_url || template?.prize_url || '',
    price_cents: normalizeCents(input.price_cents || input.item_cost_cents || template?.prize_snapshot?.price_cents || 4000),
    currency: 'USD',
  };
}

function roomPublicId() {
  return `PR-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

function profileName(user) {
  return user?.full_name || user?.name || user?.email || user?.id || 'Pilot Player';
}

async function createLedgerEntriesForRoom(store, room) {
  const breakdown = room.cost_breakdown || {};
  const rows = [
    ['prize_reserve', breakdown.item_cost_cents, `Prize reserve for ${room.prize_title}`],
    ['estimated_tax', breakdown.estimated_tax_cents, 'Estimated tax reserve'],
    ['estimated_shipping', breakdown.estimated_shipping_cents, 'Estimated shipping reserve'],
    ['fulfillment_reserve', breakdown.fulfillment_reserve_cents, 'Manual fulfillment reserve'],
    ['processing_reserve', breakdown.payment_processing_reserve_cents, 'Pilot payment processing reserve'],
    ['foundation_amount', breakdown.foundation_amount_cents, 'The Poles/Foundation 10% amount'],
  ];
  for (const [type, amount, description] of rows) {
    await store.create('prize_room_ledger_entries', {
      room_id: room.id,
      match_id: room.match_id || '',
      type,
      amount_cents: amount || 0,
      currency: breakdown.currency || 'USD',
      description,
      status: 'planned',
    }).catch(() => null);
  }
}

async function createMatchForPrizeRoom(store, room, userId) {
  const match = await store.create('north_pole_matches', {
    match_id: room.id,
    prize_room_id: room.id,
    title: room.title,
    created_by: room.created_by || userId || 'platform',
    creator_user_id: room.created_by || userId || 'platform',
    game_id: room.game_id,
    game_snapshot: {
      id: room.game_id,
      title: room.game_title,
      image: room.game_image,
      platform: room.game_platform,
      score_type: room.winning_rule,
    },
    prize_id: room.prize_id,
    prize_snapshot: {
      id: room.prize_id,
      title: room.prize_title,
      image: room.prize_image,
      image_url: room.prize_image,
      source: room.prize_source,
      product_url: room.prize_url,
      price_cents: room.cost_breakdown?.item_cost_cents || 0,
      estimated_tax_cents: room.cost_breakdown?.estimated_tax_cents || 0,
      estimated_shipping_cents: room.cost_breakdown?.estimated_shipping_cents || 0,
      currency: room.cost_breakdown?.currency || 'USD',
    },
    min_players: room.min_players,
    max_players: room.max_players,
    player_ids: room.player_ids || [],
    scores: {},
    status: room.status === 'funded' ? 'waiting_for_players' : room.status,
    winning_rule: room.winning_rule,
    verification_method: room.verification_method,
    cost_breakdown: room.cost_breakdown,
    prize_cost_breakdown: room.cost_breakdown,
    foundation_rate: room.foundation_rate,
    payment_mode: room.payment_mode,
    fulfillment_mode: room.fulfillment_mode,
    buy_in_cents: room.cost_breakdown?.per_player_contribution_cents || 0,
    entry_amount_cents: room.cost_breakdown?.per_player_contribution_cents || 0,
    sandbox_mode: false,
    pilot_payment_mode: true,
  });
  return match;
}

async function syncRoomStatusFromContributions(store, room) {
  const contributions = await store.list('player_contributions', { room_id: room.id }).catch(() => []);
  const paid = contributions.filter((row) => ['marked_paid', 'paid'].includes(row.status));
  const playerIds = [...new Set(paid.map((row) => row.user_id).filter(Boolean).map(String))];
  const targetStatus = paid.length >= Number(room.max_players || 0) ? 'funded' : paid.length > 0 ? 'awaiting_contributions' : 'open';
  const updated = await store.update('prize_rooms', room.id, {
    player_ids: playerIds,
    status: targetStatus,
    funding_status: targetStatus === 'funded' ? 'funded' : 'collecting_contributions',
  });
  if (room.match_id) {
    await store.update('north_pole_matches', room.match_id, {
      player_ids: playerIds,
      status: targetStatus === 'funded' ? 'waiting_for_players' : targetStatus,
    }).catch(() => null);
  }
  return updated;
}

async function createPrizeRoomRecord(store, input, user) {
  await ensureStarterPrizeRoomTemplates(store);
  const templateId = input.templateId || input.template_id;
  const template = templateId ? await store.findOne('prize_room_templates', { id: templateId }).catch(() => null) : null;
  const maxPlayers = input.maxPlayers || input.max_players || template?.max_players || 4;
  const minPlayers = input.minPlayers || input.min_players || template?.min_players || Math.min(2, maxPlayers);
  const prizeSnapshot = prizeSnapshotFromRoomInput(input, template);
  const foundationRate = input.foundationRate ?? input.foundation_rate ?? template?.foundation_rate ?? DEFAULT_FOUNDATION_RATE;
  const costBreakdown = buildPrizeRoomCostBreakdown({ prizeSnapshot, playerCount: maxPlayers, foundationRate });
  const gameTitle = input.gameTitle || input.game_title || template?.game_title || 'Skill Match';
  const prizeTitle = input.prizeTitle || input.prize_title || prizeSnapshot.title || template?.prize_title || 'Pilot Prize';
  const gameSnapshot = input.gameSnapshot || input.game_snapshot || {};
  const gameImage = input.gameImage
    || input.game_image
    || gameImageFromSnapshot(gameSnapshot)
    || template?.game_image
    || defaultGameImage(gameTitle);
  const prizeImage = input.prizeImage
    || input.prize_image
    || prizeImageFromSnapshot(prizeSnapshot)
    || template?.prize_image
    || defaultPrizeImage(prizeTitle);
  const room = await store.create('prize_rooms', {
    id: input.id || roomPublicId(),
    template_id: template?.id || templateId || '',
    room_type: input.roomType || input.room_type || (template ? 'template_based' : 'user_created'),
    created_by: user?.id || 'platform',
    title: input.title || template?.title || `${prizeSnapshot.title || 'Prize'} Skill Match`,
    description: input.description || template?.description || 'Pilot Prize Room for a skill-based match.',
    game_id: input.gameId || input.game_id || template?.game_id || 'north-pole-skill-match',
    game_title: gameTitle,
    game_query: input.gameQuery || input.game_query || template?.game_query || gameTitle,
    game_image: gameImage,
    game_snapshot: {
      ...(gameSnapshot && typeof gameSnapshot === 'object' ? gameSnapshot : {}),
      title: gameTitle,
      image: gameImage,
      background_image: gameImage,
    },
    game_platform: input.gamePlatform || input.game_platform || template?.game_platform || 'manual',
    prize_id: input.prizeId || input.prize_id || prizeSnapshot.id || template?.prize_id || `prize_${crypto.randomUUID()}`,
    prize_title: prizeTitle,
    prize_query: input.prizeQuery || input.prize_query || template?.prize_query || prizeTitle,
    prize_image: prizeImage,
    prize_snapshot: {
      ...(prizeSnapshot && typeof prizeSnapshot === 'object' ? prizeSnapshot : {}),
      title: prizeTitle,
      image: prizeImage,
      image_url: prizeImage,
    },
    prize_source: input.prizeSource || input.prize_source || prizeSnapshot.source || template?.prize_source || 'manual',
    prize_url: input.prizeUrl || input.prize_url || prizeSnapshot.product_url || prizeSnapshot.url || template?.prize_url || '',
    min_players: minPlayers,
    max_players: maxPlayers,
    player_ids: [],
    status: 'open',
    winning_rule: input.winningRule || input.winning_rule || template?.winning_rule || 'Highest verified score wins',
    verification_method: input.verificationMethod || input.verification_method || template?.verification_method || 'manual_score_with_proof',
    cost_breakdown: costBreakdown,
    foundation_rate: costBreakdown.foundation_rate,
    payment_mode: input.paymentMode || input.payment_mode || 'pilot_manual',
    fulfillment_mode: 'manual',
    pilot_mode_label: 'Pilot Mode: no real charge made.',
    fulfillment_note: 'Manual purchase required. Automatic purchase provider not enabled yet.',
  });
  const match = await createMatchForPrizeRoom(store, room, user?.id);
  const synced = await store.update('prize_rooms', room.id, { match_id: match.id });
  await createLedgerEntriesForRoom(store, { ...synced, match_id: match.id });
  return synced;
}

async function findEbayPrizeImageCandidate(room, env = process.env) {
  const prizeQuery = room.prize_query || room.prize_title;
  const errors = [];
  let fallbackCandidate = null;
  let provider = '';
  let providerStatus = '';
  let productCount = 0;

  try {
    const result = await searchProductsAcrossProviders({ q: prizeQuery, limit: 5 }, env);
    provider = result.provider || '';
    providerStatus = result.providerStatus || result.externalProviderStatus || '';
    const products = Array.isArray(result.products) ? result.products : [];
    productCount = products.length;
    const product = products.find((item) => isHttpsImage(extractEbayImage(item)))
      || products.find((item) => extractEbayImage(item))
      || null;
    const image = extractEbayImage(product);
    if (image && !fallbackCandidate) {
      fallbackCandidate = {
        image,
        item: product,
        source: result.provider || product?.source || 'product_search',
        product_url: product?.product_url || product?.offers?.[0]?.product_url || '',
      };
    }
    if (isHttpsImage(image)) {
      return {
        ...fallbackCandidate,
        image,
        provider,
        provider_status: providerStatus,
        product_count: productCount,
        status: 'found',
        errors,
      };
    }
    if (result.provider === 'ebay_browse' && result.providerStatus !== 'live' && result.providerMessage) {
      errors.push(result.providerMessage);
    }
  } catch (error) {
    errors.push(`searchProductsAcrossProviders: ${error.message}`);
  }

  try {
    const cleanResult = await searchEbayBrowseCleanResults({ q: prizeQuery, limit: 3 }, env);
    provider = provider || 'ebay_browse_clean';
    providerStatus = providerStatus || 'live';
    const cleanItems = Array.isArray(cleanResult.results) ? cleanResult.results : [];
    productCount = Math.max(productCount, cleanItems.length);
    const cleanItem = cleanItems.find((item) => isHttpsImage(extractEbayImage(item)))
      || cleanItems.find((item) => extractEbayImage(item))
      || null;
    const image = extractEbayImage(cleanItem);
    if (isHttpsImage(image)) {
      return {
        image,
        item: cleanItem,
        source: 'ebay_browse_clean',
        product_url: cleanItem?.itemWebUrl || '',
        provider,
        provider_status: providerStatus,
        product_count: productCount,
        status: 'found',
        errors,
      };
    }
    if (image && !fallbackCandidate) {
      fallbackCandidate = {
        image,
        item: cleanItem,
        source: 'ebay_browse_clean',
        product_url: cleanItem?.itemWebUrl || '',
      };
    }
  } catch (error) {
    errors.push(`searchEbayBrowseCleanResults: ${error.message}`);
  }

  return {
    image: fallbackCandidate?.image || '',
    item: fallbackCandidate?.item || null,
    source: fallbackCandidate?.source || '',
    product_url: fallbackCandidate?.product_url || '',
    provider,
    provider_status: providerStatus,
    product_count: productCount,
    status: fallbackCandidate?.image ? 'candidate_not_external_ebay' : 'not_found',
    errors,
  };
}

async function findRawgGameImageCandidate(room, env = process.env) {
  const gameQuery = room.game_query || room.game_title;
  const errors = [];
  let fallbackCandidate = null;

  try {
    const result = await searchGamesAcrossProviders({ q: gameQuery, limit: 5 }, env);
    const games = Array.isArray(result.games) ? result.games : [];
    const game = games.find((item) => isExternalRawgImage(extractRawgGameImage(item)))
      || games.find((item) => extractRawgGameImage(item))
      || null;
    const image = extractRawgGameImage(game);
    if (image) {
      fallbackCandidate = {
        image,
        item: game,
        source: result.provider || game?.source || 'game_search',
      };
    }
    if (isExternalRawgImage(image)) {
      return {
        ...fallbackCandidate,
        image,
        status: 'found',
        errors,
      };
    }
    if (result.provider === 'rawg' && result.providerStatus !== 'live' && result.providerMessage) {
      errors.push(result.providerMessage);
    }
  } catch (error) {
    errors.push(`searchGamesAcrossProviders: ${error.message}`);
  }

  return {
    image: fallbackCandidate?.image || '',
    item: fallbackCandidate?.item || null,
    source: fallbackCandidate?.source || '',
    status: fallbackCandidate?.image ? 'candidate_not_external_rawg' : 'not_found',
    errors,
  };
}

async function getPrizeRoomProviderImageDiagnostics(room, env = process.env) {
  const [prizeCandidate, gameCandidate] = await Promise.all([
    findEbayPrizeImageCandidate(room, env),
    findRawgGameImageCandidate(room, env),
  ]);
  const prizeWouldUpdate = Boolean(
    isHttpsImage(prizeCandidate.image)
      && (!room.prize_image || isPrizeRoomFallbackImage(room.prize_image))
      && prizeCandidate.image !== room.prize_image
  );
  const gameWouldUpdate = Boolean(
    isExternalRawgImage(gameCandidate.image)
      && (!room.game_image || isPrizeRoomFallbackImage(room.game_image))
      && gameCandidate.image !== room.game_image
  );

  return {
    room_id: room.id,
    title: room.title,
    prize_query: room.prize_query || room.prize_title || '',
    game_query: room.game_query || room.game_title || '',
    current_prize_image: room.prize_image || '',
    current_game_image: room.game_image || '',
    ebay_candidate_image_url: isHttpsImage(prizeCandidate.image) ? prizeCandidate.image : '',
    rawg_candidate_image_url: isExternalRawgImage(gameCandidate.image) ? gameCandidate.image : '',
    would_update: prizeWouldUpdate || gameWouldUpdate,
    would_update_prize_image: prizeWouldUpdate,
    would_update_game_image: gameWouldUpdate,
    provider: prizeCandidate.provider || '',
    provider_status: prizeCandidate.provider_status || '',
    product_count: prizeCandidate.product_count || 0,
    prize_candidate_status: prizeCandidate.status,
    game_candidate_status: gameCandidate.status,
    errors: [...(prizeCandidate.errors || []), ...(gameCandidate.errors || [])],
  };
}

async function hydratePrizeRoomProviderImages(store, room, env = process.env) {
  const patch = {};
  const details = {
    room_id: room.id,
    title: room.title,
    prize_status: 'skipped',
    game_status: 'skipped',
    prize_query: room.prize_query || room.prize_title || '',
    provider: '',
    provider_status: '',
    product_count: 0,
    ebay_candidate_image: '',
    current_prize_image: room.prize_image || '',
    saved_prize_image: '',
    prize_candidate_image_url: '',
    game_candidate_image_url: '',
    saved_prize_image_url: '',
    saved_game_image_url: '',
    errors: [],
  };

  if (!room.prize_image || isPrizeRoomFallbackImage(room.prize_image)) {
    const candidate = await findEbayPrizeImageCandidate(room, env);
    details.provider = candidate.provider || '';
    details.provider_status = candidate.provider_status || '';
    details.product_count = candidate.product_count || 0;
    details.ebay_candidate_image = isHttpsImage(candidate.image) ? candidate.image : '';
    details.prize_candidate_image_url = isHttpsImage(candidate.image) ? candidate.image : '';
    details.errors.push(...(candidate.errors || []));
    if (isHttpsImage(candidate.image)) {
      const product = candidate.item;
      const image = candidate.image;
      try {
        patch.prize_image = image;
        patch.prize_snapshot = {
          ...(room.prize_snapshot && typeof room.prize_snapshot === 'object' ? room.prize_snapshot : {}),
          ...(product && typeof product === 'object' ? product : {}),
          image,
          image_url: image,
          provider_image_source: 'ebay_browse',
        };
        patch.prize_url = candidate.product_url
          || product?.product_url
          || product?.offers?.[0]?.product_url
          || product?.raw_ebay?.itemWebUrl
          || room.prize_url
          || '';
        details.prize_status = 'updated';
        details.saved_prize_image = image;
        details.saved_prize_image_url = image;
      } catch (error) {
        details.prize_status = 'failed';
        details.errors.push(`Prize image: ${error.message}`);
      }
    } else if (!room.prize_image) {
      patch.prize_image = room.prize_image || defaultPrizeImage(room.prize_title);
      details.prize_status = candidate.status === 'not_found' ? 'fallback' : candidate.status;
    } else {
      details.prize_status = candidate.status === 'not_found' ? 'no_provider_image' : candidate.status;
    }
  }

  if (!room.game_image || isPrizeRoomFallbackImage(room.game_image)) {
    const candidate = await findRawgGameImageCandidate(room, env);
    details.game_candidate_image_url = isExternalRawgImage(candidate.image) ? candidate.image : '';
    details.errors.push(...(candidate.errors || []));
    if (isExternalRawgImage(candidate.image)) {
      const game = candidate.item;
      const image = candidate.image;
      try {
        patch.game_image = image;
        patch.game_snapshot = {
          ...(room.game_snapshot && typeof room.game_snapshot === 'object' ? room.game_snapshot : {}),
          ...(game && typeof game === 'object' ? game : {}),
          image,
          image_url: image,
          background_image: image,
          provider_image_source: candidate.source || game?.source || 'rawg',
        };
        details.game_status = 'updated';
        details.saved_game_image_url = image;
      } catch (error) {
        details.game_status = 'failed';
        details.errors.push(`Game image: ${error.message}`);
      }
    } else if (!room.game_image) {
      patch.game_image = room.game_image || defaultGameImage(room.game_title);
      details.game_status = candidate.status === 'not_found' ? 'fallback' : candidate.status;
    } else {
      details.game_status = candidate.status === 'not_found' ? 'no_provider_image' : candidate.status;
    }
  }

  const meaningfulPatch = Object.entries(patch).filter(([key, value]) => {
    if (key === 'prize_url') return value && value !== room.prize_url;
    return value !== undefined && JSON.stringify(value) !== JSON.stringify(room[key]);
  });

  if (!meaningfulPatch.length) {
    return { room, updated: false, details };
  }

  const updatePayload = Object.fromEntries(meaningfulPatch);
  const updatedRoom = await store.update('prize_rooms', room.id, updatePayload);
  return { room: updatedRoom, updated: true, details };
}

async function findProfileForUser(store, userId) {
  if (!userId) return null;
  return await store.findOne('profiles', { id: String(userId) }).catch(() => null)
    || await store.findOne('profiles', { auth_user_id: String(userId) }).catch(() => null)
    || await store.findOne('profiles', { authUserId: String(userId) }).catch(() => null)
    || await store.findOne('profiles', { email: String(userId) }).catch(() => null);
}

function profileDisplayName(profile, userId) {
  const data = profile?.data && typeof profile.data === 'object' ? profile.data : {};
  return data.displayName || data.full_name || data.name || profile?.displayName || profile?.full_name || profile?.name || profile?.email || userId || '';
}

function profileEmail(profile) {
  const data = profile?.data && typeof profile.data === 'object' ? profile.data : {};
  return profile?.email || data.email || '';
}

async function buildAiVerification(store, match) {
  const recommendation = await recommendWinner(store, match);
  const confidence = normalizeReportConfidence(recommendation.confidence);
  const recommendedWinner = recommendation.recommendedWinnerUserId || recommendation.recommendedWinner?.userId || null;
  let result = 'needs_review';
  const reasons = [];

  if (!recommendedWinner) {
    result = 'rejected';
    reasons.push('No eligible winner could be determined from submitted scores, proof, or referee reports.');
  } else {
    if (recommendation.lockBlockReasons?.length) reasons.push(`Review blockers: ${recommendation.lockBlockReasons.join(', ')}.`);
    if (recommendation.warnings?.length) reasons.push(`Warnings: ${recommendation.warnings.join(', ')}.`);
    if (recommendation.canLockWinner && confidence >= 0.8) result = 'approved';
    if (!reasons.length) reasons.push('Submitted winner data and proof are consistent with the current match rules.');
  }

  return {
    result,
    confidence,
    explanation: reasons.join(' '),
    recommendedWinner,
    recommendation,
  };
}

async function buildWinnerVerificationDecision(store, match, {
  claimedWinnerUserId,
  recommendation = null,
  manualLock = false,
  adminOverride = false,
  lockedBy = '',
} = {}) {
  const matchId = publicMatchId(match);
  const [entries, scores, refereeContext, disputes] = await Promise.all([
    store.list('match_entries', { matchId }).catch(() => []),
    store.list('match_scores', { matchId }).catch(() => []),
    loadRefereeContext(store, matchId).catch(() => ({ sessions: [], reports: [] })),
    store.list('match_disputes', { matchId }).catch(() => []),
  ]);
  const hasDispute = disputes.some((dispute) => !['closed', 'resolved', 'rejected'].includes(dispute.status || dispute.dispute_status || 'open'));
  const engine = new WinnerVerificationEngine();
  return engine.verify({
    match,
    matchId,
    claimedWinnerUserId,
    recommendation,
    entries,
    scores,
    refereeContext,
    refereeReports: refereeContext.reports || [],
    disputes,
    hasDispute,
    manualLock,
    adminOverride,
    lockedBy,
  });
}

async function findApprovedWinnerVerification(store, match, winnerId = '') {
  const matchId = publicMatchId(match);
  const verifications = await store.list('winner_verifications', { matchId }, { sort: '-created_at' }).catch(() => []);
  return verifications.find((verification) => (
    APPROVED_WINNER_VERIFICATION_STATUSES.has(verification.status)
    && (!winnerId || String(verification.winnerUserId || verification.winner_user_id) === String(winnerId))
  )) || null;
}

async function createPrizeFulfillment(store, match, userId) {
  try {
    const matchId = publicMatchId(match);
    console.log('[fulfillment] createPrizeFulfillment:start', {
      matchId,
      rowId: matchRowId(match),
      userId,
      winnerUserId: match?.winner_user_id,
      winnerId: match?.winner_id,
      demoMode: match?.demo_mode === true,
      testOrder: match?.test_order === true,
    });

    const winnerId = match.winner_user_id || match.winner_id;
    if (!winnerId) {
      const error = new Error('Winner must be locked before fulfillment is created');
      error.status = 400;
      throw error;
    }

    const approvedVerification = await findApprovedWinnerVerification(store, match, winnerId);
    if (!approvedVerification) {
      const error = new Error('WinnerVerification must be approved before fulfillment is created');
      error.status = 409;
      throw error;
    }

    const existing = await store.findOne('prize_fulfillments', { match_id: matchId });
    const existingForRoom = match.prize_room_id
      ? await store.findOne('prize_fulfillments', { prize_room_id: match.prize_room_id }).catch(() => null)
      : null;
    if (!existing && existingForRoom) {
      console.log('[fulfillment] createPrizeFulfillment:existing_for_room', {
        fulfillmentId: existingForRoom.id,
        matchId,
        prizeRoomId: match.prize_room_id,
      });
      return existingForRoom;
    }
    if (existing) {
      const existingBreakdown = existing.prize_cost_breakdown || match.cost_breakdown || buildPrizeCostBreakdown(match);
      if (!existing.prize_cost_breakdown) {
        await store.update('prize_fulfillments', existing.id, {
          prize_cost_breakdown: existingBreakdown,
          item_cost_cents: existingBreakdown.item_cost_cents,
          estimated_tax_cents: existingBreakdown.estimated_tax_cents,
          estimated_shipping_cents: existingBreakdown.estimated_shipping_cents,
          fulfillment_reserve_cents: existingBreakdown.fulfillment_reserve_cents,
          platform_or_foundation_amount_cents: existingBreakdown.platform_or_foundation_amount_cents,
          total_required_cents: existingBreakdown.total_required_cents,
        }).catch(() => null);
      }
      console.log('[fulfillment] createPrizeFulfillment:existing', {
        fulfillmentId: existing.id,
        matchId,
        status: existing.status,
        retailerOrderId: existing.retailer_order_id,
        trackingNumber: existing.tracking_number,
      });
      return { ...existing, prize_cost_breakdown: existingBreakdown };
    }

    const prize = normalizePrize(match);
    const prizeCostBreakdown = match.cost_breakdown || match.prize_cost_breakdown || buildPrizeCostBreakdown(match);
    const profile = await findProfileForUser(store, winnerId);
    const payload = {
      match_id: matchId,
      prize_room_id: match.prize_room_id || '',
      winner_id: winnerId,
      winner_verification_id: approvedVerification.id,
      winner_verification_status: approvedVerification.status,
      winner_verification_score: approvedVerification.confidenceScore ?? approvedVerification.confidence_score ?? 0,
      winner_verification_tier: approvedVerification.prizeValueTier ?? approvedVerification.prize_value_tier ?? '',
      winner_verification_reason: approvedVerification.approvalReason ?? approvedVerification.approval_reason ?? '',
      winner_verification_proof_sources: approvedVerification.proofSourcesUsed ?? approvedVerification.proof_sources_used ?? [],
      winner_verification_requires_manual_review: approvedVerification.requiresManualReview ?? approvedVerification.requires_manual_review ?? false,
      winner_name: profileDisplayName(profile, winnerId),
      winner_email: profileEmail(profile),
      prize_title: prize.title,
      prize_url: prize.productUrl || '',
      prize_image: prize.image || '',
      prize_source: prize.productSource,
      status: 'pending_address',
      shipping_status: 'pending_address',
      admin_approved: false,
      shipping_name: '',
      shipping_address_line1: '',
      shipping_address_line2: '',
      shipping_city: '',
      shipping_state: '',
      shipping_zip: '',
      shipping_country: 'US',
      retailer_order_id: '',
      tracking_number: '',
      admin_notes: '',
      demo_mode: match.demo_mode === true,
      test_order: match.test_order === true,
      prize_cost_breakdown: prizeCostBreakdown,
      cost_breakdown: prizeCostBreakdown,
      item_cost_cents: prizeCostBreakdown.item_cost_cents,
      estimated_tax_cents: prizeCostBreakdown.estimated_tax_cents,
      estimated_shipping_cents: prizeCostBreakdown.estimated_shipping_cents,
      fulfillment_reserve_cents: prizeCostBreakdown.fulfillment_reserve_cents,
      payment_processing_reserve_cents: prizeCostBreakdown.payment_processing_reserve_cents || 0,
      foundation_rate: prizeCostBreakdown.foundation_rate ?? DEFAULT_FOUNDATION_RATE,
      foundation_amount_cents: prizeCostBreakdown.foundation_amount_cents || prizeCostBreakdown.platform_or_foundation_amount_cents || 0,
      platform_or_foundation_amount_cents: prizeCostBreakdown.platform_or_foundation_amount_cents || prizeCostBreakdown.foundation_amount_cents || 0,
      total_required_cents: prizeCostBreakdown.total_required_cents || prizeCostBreakdown.total_room_cost_cents || 0,
      total_room_cost_cents: prizeCostBreakdown.total_room_cost_cents || prizeCostBreakdown.total_required_cents || 0,
    };

    console.log('[fulfillment] store.create prize_fulfillments:start', {
      matchId,
      winnerId,
      prizeTitle: payload.prize_title,
      status: payload.status,
      demoMode: payload.demo_mode,
      testOrder: payload.test_order,
    });
    const fulfillment = await store.create('prize_fulfillments', payload);
    console.log('[fulfillment] store.create prize_fulfillments:success', {
      fulfillmentId: fulfillment?.id,
      matchId: fulfillment?.match_id,
      status: fulfillment?.status,
      demoMode: fulfillment?.demo_mode,
      testOrder: fulfillment?.test_order,
    });

    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), {
        status: 'prize_fulfillment',
        prize_fulfillment_id: fulfillment.id,
        fulfillment_order_id: fulfillment.id,
        prize_cost_breakdown: prizeCostBreakdown,
        item_cost_cents: prizeCostBreakdown.item_cost_cents,
        estimated_tax_cents: prizeCostBreakdown.estimated_tax_cents,
        estimated_shipping_cents: prizeCostBreakdown.estimated_shipping_cents,
        fulfillment_reserve_cents: prizeCostBreakdown.fulfillment_reserve_cents,
        platform_or_foundation_amount_cents: prizeCostBreakdown.platform_or_foundation_amount_cents,
        total_required_cents: prizeCostBreakdown.total_required_cents,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'PrizeFulfillment',
      entityId: fulfillment.id,
      matchId,
      userId,
      action: 'PRIZE_FULFILLMENT_CREATED',
      metadata: {
        prizeSource: fulfillment.prize_source,
        status: fulfillment.status,
        autoPurchase: false,
        winnerVerificationId: approvedVerification.id,
        winnerVerificationStatus: approvedVerification.status,
        prizeCostBreakdown,
      },
    });

    return fulfillment;
  } catch (error) {
    console.error('[fulfillment] createPrizeFulfillment:failed', {
      matchId: publicMatchId(match),
      rowId: matchRowId(match),
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

function createFulfillmentEngine(store, env = process.env) {
  return new FulfillmentEngine({
    store,
    env,
    createFulfillment: createPrizeFulfillment,
    normalizePrize,
    audit: (event) => createAuditEvent(store, event),
  });
}

async function autoFulfillVerifiedWinner(store, match, userId, env = process.env) {
  const engine = createFulfillmentEngine(store, env);
  return engine.fulfillVerifiedWinner({ match, userId });
}

async function tryAutoFulfillVerifiedWinner(store, match, userId) {
  try {
    return { fulfillment: await autoFulfillVerifiedWinner(store, match, userId), error: null };
  } catch (error) {
    const matchId = publicMatchId(match);
    await createAuditEvent(store, {
      entityType: 'PrizeFulfillment',
      entityId: null,
      matchId,
      userId,
      action: 'PRIZE_FULFILLMENT_AUTO_FAILED',
      metadata: {
        error: error.message || 'Auto fulfillment failed',
        provider: process.env.FULFILLMENT_PROVIDER || 'mock',
        mode: process.env.FULFILLMENT_MODE || 'ai_assisted',
      },
    }).catch(() => null);
    return { fulfillment: null, error };
  }
}

function demoPrizeSnapshot() {
  return {
    id: 'demo-prize',
    title: 'Demo North Pole Prize',
    source: 'mock',
    product_url: 'https://example.com/demo-prize',
    image: '',
    price_cents: 2500,
    currency: 'USD',
    estimated_shipping_cents: DEFAULT_SHIPPING_CENTS,
  };
}

async function createDemoFulfillmentMatch(store, userId) {
  try {
    const matchId = `DEMO-${Date.now().toString(36).toUpperCase()}`;
    const winnerId = `demo_winner_${Date.now().toString(36)}`;
    console.log('[fulfillment:demo] createDemoFulfillmentMatch:start', {
      matchId,
      winnerId,
      userId,
    });

    const match = await store.create('north_pole_matches', {
      match_id: matchId,
      title: 'Demo Fulfillment Test Match',
      game_id: 'demo-fulfillment-game',
      prize_id: 'demo-prize',
      prize_snapshot: demoPrizeSnapshot(),
      status: 'fulfillment_pending',
      sandbox_mode: true,
      demo_mode: true,
      test_order: true,
      winner_id: winnerId,
      winner_user_id: winnerId,
      verified_at: now(),
      verified_by: userId,
      winner_locked_at: now(),
    });

    console.log('[fulfillment:demo] createDemoFulfillmentMatch:success', {
      matchId: publicMatchId(match),
      rowId: matchRowId(match),
      winnerId: match.winner_user_id || match.winner_id,
    });

    return match;
  } catch (error) {
    console.error('[fulfillment:demo] createDemoFulfillmentMatch:failed', {
      userId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

async function prepareDemoFulfillmentMatch(store, selectedMatchId, userId) {
  try {
    console.log('[fulfillment:demo] prepareDemoFulfillmentMatch:start', {
      selectedMatchId: selectedMatchId || null,
      userId,
    });

    const existing = selectedMatchId ? await findMatch(store, selectedMatchId) : null;
    const match = existing || await createDemoFulfillmentMatch(store, userId);
    const matchId = publicMatchId(match);
    const winnerId = match.winner_user_id || match.winner_id || `demo_winner_${Date.now().toString(36)}`;
    console.log('[fulfillment:demo] prepareDemoFulfillmentMatch:match_loaded', {
      matchId,
      rowId: matchRowId(match),
      hadExistingMatch: Boolean(existing),
      winnerId,
    });

    const patch = {
      status: 'fulfillment_pending',
      winner_id: winnerId,
      winner_user_id: winnerId,
      verified_at: match.verified_at || now(),
      verified_by: userId,
      winner_locked_at: match.winner_locked_at || now(),
      demo_mode: true,
      test_order: true,
      sandbox_mode: true,
    };
    const prizeCostBreakdown = buildPrizeCostBreakdown({ ...match, ...patch });
    Object.assign(patch, {
      prize_cost_breakdown: prizeCostBreakdown,
      item_cost_cents: prizeCostBreakdown.item_cost_cents,
      estimated_tax_cents: prizeCostBreakdown.estimated_tax_cents,
      estimated_shipping_cents: prizeCostBreakdown.estimated_shipping_cents,
      fulfillment_reserve_cents: prizeCostBreakdown.fulfillment_reserve_cents,
      platform_or_foundation_amount_cents: prizeCostBreakdown.platform_or_foundation_amount_cents,
      total_required_cents: prizeCostBreakdown.total_required_cents,
    });
    const updatedMatch = matchRowId(match)
      ? await store.update('north_pole_matches', matchRowId(match), patch).catch(() => null)
      : null;
    const fulfillmentMatch = { ...match, ...patch, ...(updatedMatch || {}) };
    console.log('[fulfillment:demo] prepareDemoFulfillmentMatch:match_marked_demo', {
      matchId: publicMatchId(fulfillmentMatch),
      rowId: matchRowId(fulfillmentMatch),
      winnerId: fulfillmentMatch.winner_user_id || fulfillmentMatch.winner_id,
      demoMode: fulfillmentMatch.demo_mode,
      testOrder: fulfillmentMatch.test_order,
    });

    const existingLocked = await store.findOne('winner_verifications', { matchId, status: 'locked' });
    if (!existingLocked) {
      const verification = await store.create('winner_verifications', {
        matchId,
        winnerUserId: winnerId,
        winningScore: null,
        verificationMethod: 'admin_review',
        status: 'locked',
        lockedBy: userId,
        lockedAt: now(),
        auditNotes: 'Demo fulfillment order test. No real players and no real purchase.',
        demo_mode: true,
        test_order: true,
        warnings: ['demo_test_order'],
      });
      console.log('[fulfillment:demo] prepareDemoFulfillmentMatch:winner_verification_created', {
        verificationId: verification?.id,
        matchId,
        winnerId,
      });
    } else {
      console.log('[fulfillment:demo] prepareDemoFulfillmentMatch:winner_verification_existing', {
        verificationId: existingLocked.id,
        matchId,
        winnerId: existingLocked.winnerUserId || existingLocked.winner_user_id,
      });
    }

    console.log('[fulfillment:demo] prepareDemoFulfillmentMatch:success', {
      matchId: publicMatchId(fulfillmentMatch),
      winnerId: fulfillmentMatch.winner_user_id || fulfillmentMatch.winner_id,
    });

    return fulfillmentMatch;
  } catch (error) {
    console.error('[fulfillment:demo] prepareDemoFulfillmentMatch:failed', {
      selectedMatchId: selectedMatchId || null,
      userId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

async function markDemoFulfillmentOrdered(store, match, fulfillment) {
  if (!matchRowId(match)) return null;
  console.log('[fulfillment:demo] store.update north_pole_matches:start', {
    matchId: publicMatchId(match),
    rowId: matchRowId(match),
    status: 'fulfillment_ordered',
    fulfillmentId: fulfillment?.id,
  });
  const updated = await store.update('north_pole_matches', matchRowId(match), {
    status: 'fulfillment_ordered',
    prize_fulfillment_id: fulfillment.id,
    fulfillment_order_id: fulfillment.id,
    demo_mode: true,
    test_order: true,
  });
  console.log('[fulfillment:demo] store.update north_pole_matches:success', {
    matchId: publicMatchId(updated || match),
    rowId: matchRowId(updated || match),
    status: updated?.status,
    fulfillmentId: updated?.prize_fulfillment_id || updated?.fulfillment_order_id,
  });
  return updated;
}

async function runDemoFulfillment(store, match, userId) {
  try {
    const engine = createFulfillmentEngine(store, {
      ...process.env,
      FULFILLMENT_PROVIDER: 'mock',
      FULFILLMENT_MODE: process.env.FULFILLMENT_MODE || 'ai_assisted',
    });
    const fulfillment = await engine.fulfillVerifiedWinner({ match, userId });
    if (!fulfillment?.id) {
      throw new Error('FulfillmentEngine completed without returning a PrizeFulfillment record');
    }

    console.log('[fulfillment:demo] store.update prize_fulfillments:start', {
      fulfillmentId: fulfillment.id,
      demoMode: true,
      testOrder: true,
    });
    const marked = await store.update('prize_fulfillments', fulfillment.id, {
      demo_mode: true,
      test_order: true,
      provider: 'mock',
      admin_notes: [
        fulfillment.admin_notes,
        'DEMO ORDER - NO REAL PURCHASE.',
      ].filter(Boolean).join('\n'),
    });
    if (!marked?.id) {
      throw new Error(`Could not mark demo fulfillment ${fulfillment.id}`);
    }
    console.log('[fulfillment:demo] store.update prize_fulfillments:success', {
      fulfillmentId: marked.id,
      status: marked.status,
      retailerOrderId: marked.retailer_order_id,
      trackingNumber: marked.tracking_number,
    });

    await markDemoFulfillmentOrdered(store, match, marked);
    return marked;
  } catch (error) {
    console.error('[fulfillment:demo] runDemoFulfillment:failed', {
      matchId: publicMatchId(match),
      userId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

function determineScoreType(match, scores) {
  const matchType = match?.score_type || match?.match_plan?.scoreType || match?.game_snapshot?.score_type;
  if (scoreTypes.includes(matchType)) return matchType;
  const scoreType = scores.find((score) => score.scoreType || score.score_type)?.scoreType
    || scores.find((score) => score.scoreType || score.score_type)?.score_type;
  if (scoreTypes.includes(scoreType)) return scoreType;
  const lowestTime = scores.find((score) => (score.scoreType || score.score_type) === 'lowest_time');
  return lowestTime ? 'lowest_time' : 'highest_score';
}

function compareScores(scoreType) {
  return (a, b) => {
    const delta = scoreType === 'lowest_time'
      ? Number(a.score) - Number(b.score)
      : Number(b.score) - Number(a.score);
    if (delta !== 0) return delta;
    return String(a.created_at || '').localeCompare(String(b.created_at || ''));
  };
}

async function findRefereeAccount(store, refereeAccountId) {
  if (!refereeAccountId) return null;
  return store.findOne('referee_accounts', { id: refereeAccountId });
}

async function isRefereeUserId(store, userId) {
  if (!userId) return false;
  const account = await store.findOne('referee_accounts', { refereeUserId: String(userId) })
    || await store.findOne('referee_accounts', { referee_user_id: String(userId) });
  return Boolean(account);
}

function normalizeReportConfidence(value) {
  const confidence = Number(value ?? 0);
  if (!Number.isFinite(confidence)) return 0;
  return Math.max(0, Math.min(1, confidence));
}

function normalizeReportScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? score : value ?? null;
}

function normalizeReportStatus(report) {
  return report?.reportStatus || report?.report_status || 'pending';
}

function normalizeRefereeReport(report) {
  if (!report) return null;
  return {
    ...report,
    refereeSessionId: report.refereeSessionId || report.referee_session_id,
    winnerUserId: report.winnerUserId || report.winner_user_id,
    loserUserIds: report.loserUserIds || report.loser_user_ids || [],
    winningScore: normalizeReportScore(report.winningScore ?? report.winning_score),
    scoreType: report.scoreType || report.score_type || 'highest_score',
    providerName: report.providerName || report.provider_name || '',
    evidenceUrls: report.evidenceUrls || report.evidence_urls || [],
    rawReport: report.rawReport || report.raw_report || {},
    signedPayload: report.signedPayload || report.signed_payload || '',
    reportStatus: normalizeReportStatus(report),
    confidence: normalizeReportConfidence(report.confidence),
  };
}

async function loadRefereeContext(store, matchId) {
  const sessions = await store.list('match_referee_sessions', { matchId }, { sort: '-created_at' });
  const reports = (await store.list('referee_reports', { matchId }, { sort: '-created_at' })).map(normalizeRefereeReport);
  const accounts = [];
  for (const session of sessions) {
    const account = await findRefereeAccount(store, session.refereeAccountId || session.referee_account_id);
    if (account) accounts.push(account);
  }
  return { sessions, reports, accounts };
}

async function getOrCreateGhostRefereeAccount(store) {
  const existing = await store.findOne('referee_accounts', { displayName: 'Ghost Referee' })
    || await store.findOne('referee_accounts', { providerName: 'The Poles Ghost Referee' });
  if (existing) return existing;
  const timestamp = now();
  return store.create('referee_accounts', {
    displayName: 'Ghost Referee',
    accountType: 'ai_referee',
    status: 'available',
    providerName: 'The Poles Ghost Referee',
    supportedModes: ['manual_evidence', 'vision_review', 'game_api', 'spectator_bot', 'native_game_sdk'],
    refereeUserId: 'referee_bot',
    role: 'referee_bot',
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

async function recommendWinner(store, match) {
  const matchId = publicMatchId(match);
  const entries = await store.list('match_entries', { matchId });
  const scores = await store.list('match_scores', { matchId });
  const refereeContext = await loadRefereeContext(store, matchId);
  const disputes = await store.list('match_disputes', { matchId });
  const openDispute = disputes.some((dispute) => !['closed', 'resolved', 'rejected'].includes(dispute.status || dispute.dispute_status || 'open'));
  const acceptedReports = refereeContext.reports.filter((report) => report.reportStatus === 'accepted');
  const pendingReports = refereeContext.reports.filter((report) => report.reportStatus === 'pending');
  const topRefereeReport = acceptedReports
    .filter((report) => report.winnerUserId)
    .sort((a, b) => b.confidence - a.confidence || String(b.created_at || '').localeCompare(String(a.created_at || '')))[0] || null;

  if (topRefereeReport) {
    const warnings = [...new Set(topRefereeReport.warnings || [])];
    const lockBlockReasons = [];
    const needsAdminReview = adminReviewRefereeSources.has(topRefereeReport.source) && !isSimulatedMatch(match);
    if (openDispute || topRefereeReport.reportStatus === 'disputed') lockBlockReasons.push('disputed_result');
    if (topRefereeReport.confidence < 0.8) lockBlockReasons.push('confidence_too_low');
    if (needsAdminReview) lockBlockReasons.push('admin_review_required');
    const canLockWinner = topRefereeReport.confidence >= 0.8
      && !openDispute
      && (autoLockRefereeSources.has(topRefereeReport.source) || (adminReviewRefereeSources.has(topRefereeReport.source) && isSimulatedMatch(match)));

    return {
      matchId,
      recommendedWinnerUserId: topRefereeReport.winnerUserId,
      winningScore: topRefereeReport.winningScore,
      scoreType: topRefereeReport.scoreType,
      confidence: topRefereeReport.confidence,
      canLockWinner,
      warnings,
      lockBlockReasons: [...new Set(lockBlockReasons)],
      scoresConsidered: scores,
      refereeReport: topRefereeReport,
      refereeContext,
      auditSummary: {
        entries: entries.length,
        submittedScores: scores.length,
        refereeSessions: refereeContext.sessions.length,
        refereeReports: refereeContext.reports.length,
        acceptedRefereeReports: acceptedReports.length,
        pendingRefereeReports: pendingReports.length,
        openDisputes: disputes.length,
      },
      recommendedWinner: {
        userId: topRefereeReport.winnerUserId,
        score: topRefereeReport.winningScore,
        scoreId: null,
        refereeReportId: topRefereeReport.id,
      },
      rankedScores: scores,
      deterministicRule: `Ghost Referee report from ${topRefereeReport.source} recommends the winner; lock eligibility follows confidence and dispute rules.`,
    };
  }

  const eligibleUserIds = new Set(entries
    .filter((entry) => !['cancelled', 'refunded', 'rejected'].includes(entry.status))
    .map((entry) => String(entry.userId || entry.user_id))
    .filter(Boolean));
  const warnings = [];
  const lockBlockReasons = [];
  if (!refereeContext.reports.length) lockBlockReasons.push('no_referee_report');
  if (pendingReports.length) lockBlockReasons.push('referee_report_pending');
  const rejectedScores = scores.filter((score) => score.verificationStatus === 'rejected');
  const pendingScores = scores.filter((score) => !score.verificationStatus || score.verificationStatus === 'pending');
  const disputedScores = scores.filter((score) => score.verificationStatus === 'disputed');
  const verifiedScores = scores.filter((score) => score.verificationStatus === 'verified');
  if (pendingScores.length) warnings.push('pending_scores_require_review');
  if (disputedScores.length) warnings.push('disputed_scores_require_manual_review');
  if (rejectedScores.length) warnings.push('rejected_scores_excluded');
  if (openDispute || disputedScores.length) lockBlockReasons.push('disputed_result');
  if (!scores.length) lockBlockReasons.push('no_scores_submitted');

  let eligibleScores = scores.filter((score) => {
    const usable = score.verificationStatus !== 'rejected'
      && Number.isFinite(Number(score.score));
    const scoreUserId = String(score.userId || score.user_id);
    return usable && (!eligibleUserIds.size || eligibleUserIds.has(scoreUserId));
  });
  const hasVerifiedScores = verifiedScores.length > 0;
  if (hasVerifiedScores) {
    eligibleScores = eligibleScores.filter((score) => score.verificationStatus === 'verified');
  }

  if (!eligibleScores.length) warnings.push('no_eligible_scores');
  const scoreType = determineScoreType(match, eligibleScores);
  const manualReview = scoreType === 'manual_review' || scoreType === 'manual';
  if (!hasVerifiedScores && !['bracket_result', 'manual_review', 'manual'].includes(scoreType)) {
    warnings.push('no_verified_scores');
    lockBlockReasons.push('no_verified_scores');
  }

  if (manualReview) {
    return {
      matchId,
      recommendedWinnerUserId: null,
      winningScore: null,
      scoreType: 'manual_review',
      confidence: 'pending_admin_review',
      canLockWinner: false,
      warnings: [...new Set([...warnings, 'manual_review_required'])],
      lockBlockReasons: [...new Set([...lockBlockReasons, 'admin_review_required'])],
      scoresConsidered: eligibleScores,
      refereeContext,
      auditSummary: {
        entries: entries.length,
        submittedScores: scores.length,
        refereeSessions: refereeContext.sessions.length,
        refereeReports: refereeContext.reports.length,
        verifiedScores: verifiedScores.length,
        pendingScores: pendingScores.length,
        disputedScores: disputedScores.length,
        rejectedScores: rejectedScores.length,
      },
      recommendedWinner: null,
      rankedScores: eligibleScores,
      deterministicRule: 'Manual review requires an admin decision before a winner can be locked.',
    };
  }

  if (scoreType === 'bracket_result') {
    const bracketWinner = match.bracket_winner_user_id || match.bracketWinnerUserId || match.match_plan?.bracketWinnerUserId || match.metadata?.bracketWinnerUserId;
    const canLockWinner = Boolean(bracketWinner) && !disputedScores.length && !rejectedScores.length;
    if (!bracketWinner) warnings.push('bracket_winner_missing');
    if (!canLockWinner && !lockBlockReasons.length) lockBlockReasons.push('admin_review_required');
    return {
      matchId,
      recommendedWinnerUserId: bracketWinner || null,
      winningScore: null,
      scoreType,
      confidence: canLockWinner ? 'high' : 'needs_review',
      canLockWinner,
      warnings: [...new Set(warnings)],
      lockBlockReasons: [...new Set(lockBlockReasons)],
      scoresConsidered: eligibleScores,
      refereeContext,
      auditSummary: {
        entries: entries.length,
        submittedScores: scores.length,
        refereeSessions: refereeContext.sessions.length,
        refereeReports: refereeContext.reports.length,
        verifiedScores: verifiedScores.length,
        pendingScores: pendingScores.length,
        disputedScores: disputedScores.length,
        rejectedScores: rejectedScores.length,
      },
      recommendedWinner: bracketWinner ? { userId: bracketWinner, score: null, scoreId: null } : null,
      rankedScores: eligibleScores,
      deterministicRule: 'Bracket result winner from the match record wins after review checks pass.',
    };
  }

  const rankedScores = [...eligibleScores].sort(compareScores(scoreType));
  const winnerScore = rankedScores[0] || null;
  const tied = winnerScore
    ? rankedScores.filter((row) => Number(row.score) === Number(winnerScore.score))
    : [];
  if (tied.length > 1) warnings.push('tie_requires_admin_review');

  const suspiciousScores = rankedScores.filter((score) => ['suspicious', 'flagged'].includes(score.aiReviewStatus));
  if (suspiciousScores.length) warnings.push('ai_evidence_review_flagged');
  if (rankedScores.some((score) => !score.evidenceUrl)) warnings.push('missing_evidence_url');
  const canLockWinner = Boolean(winnerScore)
    && hasVerifiedScores
    && tied.length <= 1
    && disputedScores.length === 0
    && rejectedScores.length === 0;
  if (!canLockWinner && winnerScore && !lockBlockReasons.length) lockBlockReasons.push('admin_review_required');

  return {
    matchId,
    recommendedWinnerUserId: winnerScore ? String(winnerScore.userId || winnerScore.user_id) : null,
    winningScore: winnerScore ? Number(winnerScore.score) : null,
    scoreType,
    confidence: canLockWinner ? 'high' : winnerScore ? 'needs_review' : 'none',
    canLockWinner,
    warnings: [...new Set(warnings)],
    lockBlockReasons: [...new Set(lockBlockReasons)],
    scoresConsidered: rankedScores,
    refereeContext,
    auditSummary: {
      entries: entries.length,
      submittedScores: scores.length,
      refereeSessions: refereeContext.sessions.length,
      refereeReports: refereeContext.reports.length,
      verifiedScores: verifiedScores.length,
      pendingScores: pendingScores.length,
      disputedScores: disputedScores.length,
      rejectedScores: rejectedScores.length,
    },
    recommendedWinner: winnerScore ? {
      userId: String(winnerScore.userId || winnerScore.user_id),
      score: Number(winnerScore.score),
      scoreId: winnerScore.id,
    } : null,
    rankedScores,
    deterministicRule: scoreType === 'lowest_time' ? 'Lowest submitted time wins.' : 'Highest submitted score wins.',
  };
}

export function createMatchFlowRouter({ store }) {
  const router = express.Router();

  router.post('/matches/:matchId/join-simulated', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const input = joinSchema.parse(req.body || {});
    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!['open', 'waiting_for_players'].includes(match.status)) {
      return res.status(400).json({ success: false, error: 'Match is not accepting entries' });
    }

    const matchId = publicMatchId(match);
    if (await isRefereeUserId(store, user.id)) {
      return res.status(403).json({ success: false, error: 'Referee accounts cannot join as competing players' });
    }
    const existing = await store.findOne('match_entries', { matchId, userId: user.id });
    if (existing?.status === 'paid') return res.status(400).json({ success: false, error: 'You have already joined this match' });

    const entry = existing
      ? await store.update('match_entries', existing.id, {
        status: 'paid',
        entryAmount: input.entryAmount ?? input.entry_amount ?? match.buy_in_cents ?? match.entry_amount_cents ?? 0,
        currency: input.currency || 'USD',
        paymentProvider: SIMULATED_PROVIDER,
        paymentIntentId: existing.paymentIntentId || makeId('sim_payment'),
      })
      : await store.create('match_entries', {
        matchId,
        userId: user.id,
        status: 'paid',
        entryAmount: input.entryAmount ?? input.entry_amount ?? match.buy_in_cents ?? match.entry_amount_cents ?? 0,
        currency: input.currency || 'USD',
        paymentProvider: SIMULATED_PROVIDER,
        paymentIntentId: makeId('sim_payment'),
      });

    const playerIds = Array.isArray(match.player_ids) ? match.player_ids.map(String) : [];
    if (!playerIds.includes(String(user.id)) && matchRowId(match)) {
      const nextPlayerIds = [...playerIds, user.id];
      const full = Number(match.max_players || match.player_slots || 0) > 0 && nextPlayerIds.length >= Number(match.max_players || match.player_slots || 0);
      await store.update('north_pole_matches', matchRowId(match), {
        player_ids: nextPlayerIds,
        status: full ? 'in_progress' : 'waiting_for_players',
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'MatchEntry',
      entityId: entry.id,
      matchId,
      userId: user.id,
      action: 'MATCH_ENTRY_SIMULATED_PAID',
      metadata: { paymentProvider: SIMULATED_PROVIDER },
    });

    ok(res, { entry, data: entry });
  }));

  router.post('/matches/:matchId/leave', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!['open', 'waiting_for_players'].includes(match.status)) {
      return res.status(400).json({ success: false, error: 'You can only leave a prize room before it starts' });
    }
    if (isMatchCreator(match, user)) {
      return res.status(400).json({ success: false, error: 'Creators should cancel the prize room instead of leaving it' });
    }

    const userIds = matchUserIds(user);
    const playerIds = Array.isArray(match.player_ids) ? match.player_ids.map(String) : [];
    if (!playerIds.some((id) => userIds.includes(id))) {
      return res.status(400).json({ success: false, error: 'You have not joined this prize room' });
    }

    const nextPlayerIds = playerIds.filter((id) => !userIds.includes(id));
    const updated = matchRowId(match)
      ? await store.update('north_pole_matches', matchRowId(match), {
        player_ids: nextPlayerIds,
        status: nextPlayerIds.length > 1 ? 'waiting_for_players' : 'open',
      })
      : match;

    const entry = await store.findOne('match_entries', { matchId: publicMatchId(match), userId: user.id });
    if (entry) {
      await store.update('match_entries', entry.id, {
        status: 'cancelled',
        cancelledAt: now(),
        cancelledBy: user.id,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'NorthPoleMatch',
      entityId: matchRowId(match),
      matchId: publicMatchId(match),
      userId: user.id,
      action: 'MATCH_PLAYER_LEFT',
      metadata: { nextPlayerCount: nextPlayerIds.length },
    });

    ok(res, { match: updated, data: updated });
  }));

  router.post('/matches/:matchId/cancel', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!isAdmin(user) && !isMatchCreator(match, user)) {
      return res.status(403).json({ success: false, error: 'Only the creator or an admin can cancel this prize room' });
    }
    if (!cancellableMatchStatuses.has(match.status)) {
      return res.status(400).json({ success: false, error: `Prize rooms with status "${match.status}" cannot be cancelled` });
    }
    if (!matchRowId(match)) {
      return res.status(400).json({ success: false, error: 'This match cannot be cancelled from this flow' });
    }

    const timestamp = now();
    const updated = await store.update('north_pole_matches', matchRowId(match), {
      status: 'cancelled',
      cancelled_at: timestamp,
      cancelled_by: user.id,
    });

    await createAuditEvent(store, {
      entityType: 'NorthPoleMatch',
      entityId: matchRowId(match),
      matchId: publicMatchId(match),
      userId: user.id,
      action: 'MATCH_CANCELLED',
      metadata: { previousStatus: match.status, cancelledAt: timestamp },
    });

    ok(res, { match: updated, data: updated });
  }));

  router.post('/matches/:matchId/assign-referee', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to assign a referee' });

    const input = assignRefereeSchema.parse(req.body || {});
    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });

    const matchId = publicMatchId(match);
    const requestedAccountId = input.refereeAccountId || input.referee_account_id;
    const refereeAccount = requestedAccountId
      ? await findRefereeAccount(store, requestedAccountId)
      : await getOrCreateGhostRefereeAccount(store);
    if (!refereeAccount) return res.status(404).json({ success: false, error: 'Referee account not found' });
    if (refereeAccount.status === 'disabled') return res.status(400).json({ success: false, error: 'Referee account is disabled' });

    const playerIds = Array.isArray(match.player_ids) ? match.player_ids.map(String) : [];
    const refereeUserId = refereeAccount.refereeUserId || refereeAccount.referee_user_id || refereeAccount.id;
    if (playerIds.includes(String(refereeUserId))) {
      return res.status(409).json({ success: false, error: 'Referee account is already listed as a player and cannot be assigned' });
    }

    const timestamp = now();
    const session = await store.create('match_referee_sessions', {
      matchId,
      refereeAccountId: refereeAccount.id,
      refereeUserId,
      status: 'assigned',
      joinMethod: input.joinMethod || input.join_method || 'spectator_mode',
      externalLobbyId: input.externalLobbyId || input.external_lobby_id || '',
      streamUrl: input.streamUrl || input.stream_url || '',
      startedAt: null,
      endedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await store.update('referee_accounts', refereeAccount.id, { status: 'assigned', updatedAt: timestamp }).catch(() => null);
    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), {
        status: session.joinMethod ? 'referee_assigned' : 'waiting_for_referee',
        referee_session_id: session.id,
        referee_account_id: refereeAccount.id,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'MatchRefereeSession',
      entityId: session.id,
      matchId,
      userId: user.id,
      action: 'referee_assigned',
      metadata: {
        refereeAccountId: refereeAccount.id,
        refereeUserId,
        accountType: refereeAccount.accountType,
        joinMethod: session.joinMethod,
      },
    });

    ok(res, { refereeAccount, session, data: session });
  }));

  router.post('/matches/:matchId/start-referee-session', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to start a referee session' });

    const input = startRefereeSessionSchema.parse(req.body || {});
    const refereeSessionId = input.refereeSessionId || input.referee_session_id;
    if (!refereeSessionId) return res.status(400).json({ success: false, error: 'Referee session ID is required' });

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const session = await store.findOne('match_referee_sessions', { id: refereeSessionId });
    if (!session || String(session.matchId || session.match_id) !== String(matchId)) {
      return res.status(404).json({ success: false, error: 'Referee session not found for this match' });
    }

    const updated = await store.update('match_referee_sessions', session.id, {
      status: 'observing',
      startedAt: session.startedAt || now(),
      updatedAt: now(),
    });
    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), { status: 'referee_observing' }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'MatchRefereeSession',
      entityId: session.id,
      matchId,
      userId: user.id,
      action: 'referee_session_started',
      metadata: { refereeSessionId: session.id },
    });

    ok(res, { session: updated, data: updated });
  }));

  router.post('/matches/:matchId/referee-report', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to submit a referee report' });

    const input = refereeReportSchema.parse(req.body || {});
    const refereeSessionId = input.refereeSessionId || input.referee_session_id;
    if (!refereeSessionId) return res.status(400).json({ success: false, error: 'Referee session ID is required' });

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const session = await store.findOne('match_referee_sessions', { id: refereeSessionId });
    if (!session || String(session.matchId || session.match_id) !== String(matchId)) {
      return res.status(404).json({ success: false, error: 'Referee session not found for this match' });
    }

    const winnerUserId = input.winnerUserId || input.winner_user_id;
    if (winnerUserId && await isRefereeUserId(store, winnerUserId)) {
      return res.status(403).json({ success: false, error: 'Referee accounts cannot be reported as winners' });
    }

    const report = await store.create('referee_reports', {
      matchId,
      refereeSessionId: session.id,
      refereeAccountId: session.refereeAccountId || session.referee_account_id || null,
      refereeUserId: session.refereeUserId || session.referee_user_id || null,
      source: input.source,
      providerName: input.providerName || input.provider_name || '',
      winnerUserId,
      loserUserIds: input.loserUserIds || input.loser_user_ids || [],
      winningScore: normalizeReportScore(input.winningScore ?? input.winning_score),
      scoreType: input.scoreType || input.score_type || 'highest_score',
      confidence: normalizeReportConfidence(input.confidence),
      evidenceUrls: input.evidenceUrls || input.evidence_urls || [],
      rawReport: input.rawReport || input.raw_report || {},
      warnings: input.warnings || [],
      signedPayload: input.signedPayload || input.signed_payload || '',
      reportStatus: input.reportStatus || input.report_status || 'accepted',
      createdAt: now(),
      updatedAt: now(),
    });
    await store.update('match_referee_sessions', session.id, {
      status: 'report_submitted',
      endedAt: now(),
      updatedAt: now(),
    }).catch(() => null);
    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), { status: 'pending_verification' }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'RefereeReport',
      entityId: report.id,
      matchId,
      userId: user.id,
      action: 'referee_report_submitted',
      metadata: {
        refereeSessionId: session.id,
        source: report.source,
        providerName: report.providerName,
        winnerUserId: report.winnerUserId,
        confidence: report.confidence,
        reportStatus: report.reportStatus,
      },
    });

    ok(res, { report, data: report });
  }));

  router.post('/matches/:matchId/simulate-referee-report', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to simulate a Ghost Referee report' });

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const scores = await store.list('match_scores', { matchId });
    const rankedScores = scores
      .filter((score) => score.verificationStatus !== 'rejected' && Number.isFinite(Number(score.score)))
      .sort(compareScores('highest_score'));
    const winnerScore = rankedScores[0];
    if (!winnerScore) return res.status(400).json({ success: false, error: 'No scores submitted for Ghost Referee simulation' });

    const refereeAccount = await getOrCreateGhostRefereeAccount(store);
    const timestamp = now();
    const session = await store.create('match_referee_sessions', {
      matchId,
      refereeAccountId: refereeAccount.id,
      refereeUserId: refereeAccount.refereeUserId || 'referee_bot',
      status: 'report_submitted',
      joinMethod: 'spectator_mode',
      externalLobbyId: '',
      streamUrl: '',
      startedAt: timestamp,
      endedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await store.update('referee_accounts', refereeAccount.id, { status: 'assigned', updatedAt: timestamp }).catch(() => null);

    const report = await store.create('referee_reports', {
      matchId,
      refereeSessionId: session.id,
      refereeAccountId: refereeAccount.id,
      refereeUserId: refereeAccount.refereeUserId || 'referee_bot',
      source: 'spectator_bot',
      providerName: 'The Poles Ghost Referee',
      winnerUserId: String(winnerScore.userId || winnerScore.user_id),
      loserUserIds: rankedScores.slice(1).map((score) => String(score.userId || score.user_id)),
      winningScore: Number(winnerScore.score),
      scoreType: winnerScore.scoreType || winnerScore.score_type || 'highest_score',
      confidence: 1,
      evidenceUrls: winnerScore.evidenceUrl ? [winnerScore.evidenceUrl] : [],
      rawReport: {
        simulated: true,
        basis: 'highest_score',
        scoresConsidered: rankedScores,
      },
      warnings: [],
      signedPayload: '',
      reportStatus: 'accepted',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), {
        status: 'pending_verification',
        referee_session_id: session.id,
        referee_account_id: refereeAccount.id,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'MatchRefereeSession',
      entityId: session.id,
      matchId,
      userId: user.id,
      action: 'referee_assigned',
      metadata: { refereeAccountId: refereeAccount.id, joinMethod: 'spectator_mode', simulated: true },
    });
    await createAuditEvent(store, {
      entityType: 'MatchRefereeSession',
      entityId: session.id,
      matchId,
      userId: user.id,
      action: 'referee_session_started',
      metadata: { refereeSessionId: session.id, simulated: true },
    });
    await createAuditEvent(store, {
      entityType: 'RefereeReport',
      entityId: report.id,
      matchId,
      userId: user.id,
      action: 'referee_report_submitted',
      metadata: {
        refereeSessionId: session.id,
        source: report.source,
        providerName: report.providerName,
        winnerUserId: report.winnerUserId,
        confidence: report.confidence,
        reportStatus: report.reportStatus,
        simulated: true,
      },
    });

    ok(res, { refereeAccount, session, report, data: report });
  }));

  router.post('/matches/:matchId/submit-score', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const input = submitScoreSchema.parse(req.body || {});
    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    if (!['in_progress', 'pending_verification'].includes(match.status)) {
      return res.status(400).json({ success: false, error: 'Results can only be submitted for prize rooms that are in progress' });
    }

    const matchId = publicMatchId(match);
    const submittingUserId = input.userId || input.user_id || user.id;
    if (await isRefereeUserId(store, submittingUserId)) {
      return res.status(403).json({ success: false, error: 'Referee accounts cannot submit competing scores' });
    }
    if (String(submittingUserId) !== String(user.id) && !isAdmin(user)) {
      return res.status(403).json({ success: false, error: 'Only admins can submit a score for another user' });
    }
    const entry = await store.findOne('match_entries', { matchId, userId: submittingUserId });
    const playerIds = Array.isArray(match.player_ids) ? match.player_ids.map(String) : [];
    if (entry?.status !== 'paid' && !playerIds.includes(String(submittingUserId))) {
      return res.status(403).json({ success: false, error: 'Only paid simulated entrants can submit scores' });
    }

    const scoreType = input.scoreType || input.score_type || determineScoreType(match, []);
    const normalizedScoreType = scoreType === 'manual' ? 'manual_review' : scoreType;
    const numericScore = Number(input.score);
    if (['highest_score', 'lowest_time'].includes(normalizedScoreType) && !Number.isFinite(numericScore)) {
      return res.status(400).json({ success: false, error: 'Score must be numeric for highest_score and lowest_time matches' });
    }

    const evidenceUrl = input.evidenceUrl || input.evidence_url || '';
    const evidenceNotes = input.evidenceNotes || input.evidence_notes || '';
    const score = await store.create('match_scores', {
      matchId,
      userId: submittingUserId,
      score: Number.isFinite(numericScore) ? numericScore : input.score,
      scoreType: normalizedScoreType,
      evidenceUrl,
      evidenceNotes,
      platformUsername: input.platformUsername || input.platform_username || '',
      matchRound: input.matchRound || input.match_round || '',
      metadata: input.metadata || {},
      verificationStatus: 'pending',
      aiReviewStatus: 'not_reviewed',
    });

    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), { status: 'pending_verification' }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'MatchScore',
      entityId: score.id,
      matchId,
      userId: submittingUserId,
      action: 'score_submitted',
      metadata: {
        submittedBy: user.id,
        score: score.score,
        scoreType: normalizedScoreType,
        evidenceUrl: Boolean(evidenceUrl),
      },
    });

    ok(res, { score, data: score });
  }));

  router.post('/matches/:matchId/review-score', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to review scores' });

    const input = reviewScoreSchema.parse(req.body || {});
    const scoreId = input.scoreId || input.score_id;
    if (!scoreId) return res.status(400).json({ success: false, error: 'Score ID is required' });

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const score = await store.findOne('match_scores', { id: scoreId });
    if (!score || String(score.matchId || score.match_id) !== String(matchId)) {
      return res.status(404).json({ success: false, error: 'Score not found for this match' });
    }

    const patch = {
      verificationStatus: input.verificationStatus || input.verification_status || score.verificationStatus || 'pending',
      aiReviewStatus: input.aiReviewStatus || input.ai_review_status || score.aiReviewStatus || 'not_reviewed',
      reviewNotes: input.reviewNotes || input.review_notes || '',
      reviewedBy: input.reviewedBy || input.reviewed_by || user.id,
      reviewedAt: now(),
    };
    const reviewed = await store.update('match_scores', score.id, patch);

    await createAuditEvent(store, {
      entityType: 'MatchScore',
      entityId: score.id,
      matchId,
      userId: user.id,
      action: 'score_reviewed',
      metadata: patch,
    });

    ok(res, { score: reviewed, data: reviewed });
  }));

  router.post('/matches/:matchId/verify-winner', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to verify winners' });

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });

    const recommendation = await recommendWinner(store, match);
    const claimedWinnerUserId = recommendation.recommendedWinnerUserId || recommendation.recommendedWinner?.userId || null;
    const verificationDecision = claimedWinnerUserId
      ? await buildWinnerVerificationDecision(store, match, { claimedWinnerUserId, recommendation })
      : null;
    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), { status: 'pending_verification' }).catch(() => null);
    }
    await createAuditEvent(store, {
      entityType: 'WinnerVerification',
      entityId: null,
      matchId: recommendation.matchId,
      userId: user.id,
      action: 'winner_recommended',
      metadata: {
        recommendedWinnerUserId: recommendation.recommendedWinnerUserId,
        winningScore: recommendation.winningScore,
        scoreType: recommendation.scoreType,
        confidence: recommendation.confidence,
        verificationScore: verificationDecision?.confidenceScore ?? 0,
        verificationStatus: verificationDecision?.status || 'manual_review',
        canLockWinner: recommendation.canLockWinner,
        lockBlockReasons: recommendation.lockBlockReasons,
        warnings: recommendation.warnings,
        refereeReportId: recommendation.refereeReport?.id || null,
        auditSummary: recommendation.auditSummary,
      },
    });

    ok(res, {
      ...recommendation,
      verificationDecision,
      canLockWinner: recommendation.canLockWinner && (!verificationDecision || verificationDecision.status === 'approved'),
      data: { ...recommendation, verificationDecision },
    });
  }));

  router.post('/matches/:id/ai-verify', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to run AI referee review' });

    const match = await findMatch(store, req.params.id);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });

    const review = await buildAiVerification(store, match);
    const matchId = publicMatchId(match);
    const payload = {
      approved: review.result === 'approved',
      rejected: review.result === 'rejected',
      needs_review: review.result === 'needs_review',
      result: review.result,
      status: review.result,
      confidence_score: review.confidence,
      confidenceScore: review.confidence,
      explanation: review.explanation,
      recommended_winner: review.recommendedWinner,
      recommendedWinner: review.recommendedWinner,
      reviewed_at: now(),
      reviewed_by: user.id,
      auto_purchase: false,
    };

    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), {
        ai_referee_status: review.result,
        ai_referee_confidence: review.confidence,
        ai_referee_explanation: review.explanation,
        ai_referee_recommended_winner: review.recommendedWinner,
        ai_referee_reviewed_at: payload.reviewed_at,
        status: review.result === 'approved' ? 'pending_verification' : match.status,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'AIRefereeReview',
      entityId: null,
      matchId,
      userId: user.id,
      action: 'AI_REFEREE_REVIEWED_WINNER',
      metadata: {
        ...payload,
        lockBlockReasons: review.recommendation.lockBlockReasons,
        warnings: review.recommendation.warnings,
      },
    });

    ok(res, { ...payload, recommendation: review.recommendation, data: payload });
  }));

  router.post('/matches/:matchId/lock-winner', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const input = lockWinnerSchema.parse(req.body || {});
    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const existingLocked = await store.findOne('winner_verifications', { matchId, status: 'approved' });
    const adminOverride = input.adminOverride === true || input.admin_override === true;
    if ((match.winner_locked_at || existingLocked) && (!isAdmin(user) || !adminOverride)) {
      const locked = existingLocked || {
        matchId,
        winnerUserId: match.winner_user_id || match.winner_id,
        status: 'approved',
        lockedAt: match.winner_locked_at,
      };
      return ok(res, { verification: locked, data: locked, alreadyLocked: true });
    }

    const recommendation = await recommendWinner(store, match);
    const requestedWinner = input.winnerUserId || input.winner_user_id || recommendation.recommendedWinnerUserId;
    if (!requestedWinner) return res.status(400).json({ success: false, error: 'No winner can be locked until scores are submitted' });
    if (await isRefereeUserId(store, requestedWinner)) {
      return res.status(403).json({ success: false, error: 'Referee accounts cannot receive prizes or be locked as winner' });
    }
    const lockedBy = input.lockedBy || input.locked_by || user.id;
    const manualLock = isAdmin(user) && ['admin', 'manual_review', user.id].includes(String(lockedBy));
    const verificationDecision = await buildWinnerVerificationDecision(store, match, {
      claimedWinnerUserId: requestedWinner,
      recommendation,
      manualLock,
      adminOverride,
      lockedBy,
    });
    if (!manualLock) {
      if (!recommendation.canLockWinner) {
        return res.status(409).json({ success: false, error: 'Winner cannot be locked until verification warnings are resolved', recommendation });
      }
      if (String(requestedWinner) !== String(recommendation.recommendedWinnerUserId)) {
        return res.status(403).json({ success: false, error: 'Requested winner does not match the deterministic recommendation' });
      }
      if (verificationDecision.status !== 'approved') {
        return res.status(409).json({
          success: false,
          error: verificationDecision.hasDispute
            ? 'WinnerVerification requires manual review because a dispute is open'
            : 'WinnerVerification confidence is below the approval threshold',
          verificationDecision,
          recommendation,
        });
      }
    }

    const winningScore = input.winningScore ?? input.winning_score ?? recommendation.winningScore ?? null;
    const verificationMethod = input.verificationMethod || input.verification_method || (recommendation.warnings.length ? 'admin_review' : 'automatic');
    const verification = await store.create('winner_verifications', {
      matchId: recommendation.matchId,
      winnerUserId: requestedWinner,
      winningScore,
      verificationMethod,
      status: verificationDecision.status,
      lockedBy,
      lockedAt: now(),
      auditNotes: input.auditNotes || input.audit_notes || [
        recommendation.deterministicRule,
        recommendation.warnings.length ? `Warnings: ${recommendation.warnings.join(', ')}` : 'No warnings.',
        verificationDecision.approvalReason,
      ].join(' '),
      claimedWinner: requestedWinner,
      confidenceScore: verificationDecision.confidenceScore,
      approvalThreshold: verificationDecision.approvalThreshold,
      approvalReason: verificationDecision.approvalReason,
      proofSourcesUsed: verificationDecision.proofSourcesUsed,
      proofSourceResults: verificationDecision.sourceResults,
      prizeValueCents: verificationDecision.prizeValueCents,
      prizeValueTier: verificationDecision.prizeValueTier,
      prizeValueRule: verificationDecision.prizeValueRule,
      requiresManualReview: verificationDecision.requiresManualReview,
      hasDispute: verificationDecision.hasDispute,
      fulfillmentStatus: verificationDecision.status === 'approved' ? 'eligible' : 'manual_review_required',
      recommendedWinner: recommendation.recommendedWinner,
      refereeReport: recommendation.refereeReport || null,
      refereeContext: recommendation.refereeContext || null,
      lockBlockReasons: recommendation.lockBlockReasons || [],
      warnings: recommendation.warnings,
      scoresConsidered: recommendation.scoresConsidered,
      auditSummary: recommendation.auditSummary,
    });

    if (matchRowId(match)) {
      const prizeCostBreakdown = buildPrizeCostBreakdown(match);
      await store.update('north_pole_matches', matchRowId(match), {
        status: verificationDecision.status === 'approved' ? 'fulfillment_pending' : 'pending_verification',
        winner_id: requestedWinner,
        winner_user_id: requestedWinner,
        verified_at: verificationDecision.status === 'approved' ? now() : null,
        verified_by: user.id,
        winner_locked_at: now(),
        winner_verification_id: verification.id,
        winner_verification_status: verificationDecision.status,
        winner_verification_score: verificationDecision.confidenceScore,
        winner_verification_tier: verificationDecision.prizeValueTier,
        winner_verification_reason: verificationDecision.approvalReason,
        winner_verification_proof_sources: verificationDecision.proofSourcesUsed,
        winner_verification_requires_manual_review: verificationDecision.requiresManualReview,
        prize_cost_breakdown: prizeCostBreakdown,
        item_cost_cents: prizeCostBreakdown.item_cost_cents,
        estimated_tax_cents: prizeCostBreakdown.estimated_tax_cents,
        estimated_shipping_cents: prizeCostBreakdown.estimated_shipping_cents,
        fulfillment_reserve_cents: prizeCostBreakdown.fulfillment_reserve_cents,
        platform_or_foundation_amount_cents: prizeCostBreakdown.platform_or_foundation_amount_cents,
        total_required_cents: prizeCostBreakdown.total_required_cents,
      }).catch(() => null);
      if (match.prize_room_id) {
        await store.update('prize_rooms', match.prize_room_id, {
          status: verificationDecision.status === 'approved' ? 'fulfillment_pending' : 'pending_verification',
          winner_user_id: requestedWinner,
          winner_verification_id: verification.id,
          winner_verification_status: verificationDecision.status,
          winner_verification_score: verificationDecision.confidenceScore,
          winner_verification_tier: verificationDecision.prizeValueTier,
          winner_verification_reason: verificationDecision.approvalReason,
          winner_verification_proof_sources: verificationDecision.proofSourcesUsed,
          winner_verification_requires_manual_review: verificationDecision.requiresManualReview,
          winner_locked_at: now(),
        }).catch(() => null);
      }
    }

    await createAuditEvent(store, {
      entityType: 'WinnerVerification',
      entityId: verification.id,
      matchId: recommendation.matchId,
      userId: user.id,
      action: 'winner_locked',
      metadata: {
        winnerUserId: requestedWinner,
        winningScore,
        verificationMethod,
        lockedBy,
        manualLock,
        winnerVerificationStatus: verificationDecision.status,
        confidenceScore: verificationDecision.confidenceScore,
        proofSourcesUsed: verificationDecision.proofSourcesUsed,
      },
    });

    const fulfillmentResult = verificationDecision.status === 'approved'
      ? await tryAutoFulfillVerifiedWinner(store, { ...match, winner_user_id: requestedWinner, winner_id: requestedWinner }, user.id)
      : { fulfillment: null, error: new Error('Manual review required before fulfillment') };

    ok(res, {
      verification,
      fulfillment: fulfillmentResult.fulfillment,
      fulfillmentError: fulfillmentResult.error?.message || null,
      data: verification,
    });
  }));

  router.post('/matches/:matchId/dispute-winner', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const input = disputeWinnerSchema.parse(req.body || {});
    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const disputingUserId = input.userId || input.user_id || user.id;
    if (String(disputingUserId) !== String(user.id) && !isAdmin(user)) {
      return res.status(403).json({ success: false, error: 'Only admins can open a dispute for another user' });
    }

    const lockedVerification = await store.findOne('winner_verifications', { matchId, status: 'locked' });
    const disputedVerification = lockedVerification
      ? await store.update('winner_verifications', lockedVerification.id, {
        status: 'disputed',
        disputeReason: input.reason,
        disputeEvidenceUrl: input.evidenceUrl || input.evidence_url || '',
        disputedBy: disputingUserId,
        disputedAt: now(),
      })
      : null;

    const scores = await store.list('match_scores', { matchId });
    const relatedScores = scores.filter((score) => String(score.userId || score.user_id) === String(disputingUserId)
      || (lockedVerification?.winnerUserId && String(score.userId || score.user_id) === String(lockedVerification.winnerUserId)));
    for (const score of relatedScores) {
      if (score.verificationStatus !== 'rejected') {
        await store.update('match_scores', score.id, { verificationStatus: 'disputed' }).catch(() => null);
      }
    }
    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), { status: 'disputed' }).catch(() => null);
    }

    const dispute = await store.create('match_disputes', {
      matchId,
      userId: disputingUserId,
      winnerVerificationId: lockedVerification?.id || null,
      reason: input.reason,
      evidenceUrl: input.evidenceUrl || input.evidence_url || '',
      status: 'open',
    });

    await createAuditEvent(store, {
      entityType: 'WinnerVerification',
      entityId: lockedVerification?.id || dispute.id,
      matchId,
      userId: disputingUserId,
      action: 'winner_disputed',
      metadata: { reason: input.reason, evidenceUrl: Boolean(input.evidenceUrl || input.evidence_url), relatedScoreIds: relatedScores.map((score) => score.id) },
    });

    ok(res, { status: 'disputed', dispute, verification: disputedVerification, data: dispute });
  }));

  router.post('/matches/:matchId/admin-override-winner', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required to override winners' });

    const input = adminOverrideWinnerSchema.parse(req.body || {});
    const newWinnerUserId = input.newWinnerUserId || input.new_winner_user_id;
    if (!newWinnerUserId) return res.status(400).json({ success: false, error: 'New winner user ID is required' });
    if (await isRefereeUserId(store, newWinnerUserId)) {
      return res.status(403).json({ success: false, error: 'Referee accounts cannot receive prizes or be locked as winner' });
    }

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const previousLocked = await store.findOne('winner_verifications', { matchId, status: 'locked' });
    if (previousLocked) {
      await store.update('winner_verifications', previousLocked.id, {
        status: 'overturned',
        overturnedBy: input.adminUserId || input.admin_user_id || user.id,
        overturnedAt: now(),
        overrideReason: input.reason,
      });
    }

    const recommendation = await recommendWinner(store, match);
    const override = await store.create('winner_verifications', {
      matchId,
      winnerUserId: newWinnerUserId,
      winningScore: null,
      verificationMethod: 'admin_review',
      status: 'locked',
      lockedBy: input.adminUserId || input.admin_user_id || user.id,
      lockedAt: now(),
      auditNotes: input.reason,
      overrideEvidenceUrl: input.evidenceUrl || input.evidence_url || '',
      previousWinnerVerificationId: previousLocked?.id || null,
      recommendedWinner: recommendation.recommendedWinner,
      warnings: [...new Set([...(recommendation.warnings || []), 'admin_override_applied'])],
      auditSummary: recommendation.auditSummary,
    });

    if (matchRowId(match)) {
      const prizeCostBreakdown = buildPrizeCostBreakdown(match);
      await store.update('north_pole_matches', matchRowId(match), {
        status: 'fulfillment_pending',
        winner_id: newWinnerUserId,
        winner_user_id: newWinnerUserId,
        verified_at: now(),
        verified_by: user.id,
        winner_locked_at: now(),
        winner_verification_id: override.id,
        prize_cost_breakdown: prizeCostBreakdown,
        item_cost_cents: prizeCostBreakdown.item_cost_cents,
        estimated_tax_cents: prizeCostBreakdown.estimated_tax_cents,
        estimated_shipping_cents: prizeCostBreakdown.estimated_shipping_cents,
        fulfillment_reserve_cents: prizeCostBreakdown.fulfillment_reserve_cents,
        platform_or_foundation_amount_cents: prizeCostBreakdown.platform_or_foundation_amount_cents,
        total_required_cents: prizeCostBreakdown.total_required_cents,
      }).catch(() => null);
      if (match.prize_room_id) {
        await store.update('prize_rooms', match.prize_room_id, {
          status: 'fulfillment_pending',
          winner_user_id: newWinnerUserId,
          winner_verification_id: override.id,
          winner_locked_at: now(),
        }).catch(() => null);
      }
    }

    await createAuditEvent(store, {
      entityType: 'WinnerVerification',
      entityId: override.id,
      matchId,
      userId: user.id,
      action: 'winner_overridden',
      metadata: {
        previousWinnerUserId: previousLocked?.winnerUserId || null,
        newWinnerUserId,
        reason: input.reason,
        evidenceUrl: Boolean(input.evidenceUrl || input.evidence_url),
      },
    });

    const fulfillmentResult = await tryAutoFulfillVerifiedWinner(store, match, user.id);

    ok(res, {
      verification: override,
      previousVerification: previousLocked,
      fulfillment: fulfillmentResult.fulfillment,
      fulfillmentError: fulfillmentResult.error?.message || null,
      data: override,
    });
  }));

  router.post('/prize-rooms/calculate', asyncHandler(async (req, res) => {
    const input = calculatePrizeRoomCheckoutSchema.parse(req.body || {});
    const prizeSnapshot = input.prizeSnapshot || input.prize_snapshot || {};
    const playerCount = input.playerCount || input.player_count || input.maxPlayers || input.max_players || 4;
    const foundationRate = input.foundationRate ?? input.foundation_rate ?? DEFAULT_FOUNDATION_RATE;
    const costBreakdown = buildPrizeRoomCostBreakdown({ prizeSnapshot, playerCount, foundationRate });
    ok(res, { costBreakdown, data: costBreakdown });
  }));

  router.get('/prize-products', asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const q = String(req.query.q || req.query.query || 'gaming prize').trim() || 'gaming prize';
    let result;
    let providerProducts;
    let fallbackReason = null;
    try {
      result = await searchEbayBrowseCleanResults({ q, limit, offset }, process.env);
      providerProducts = Array.isArray(result.results)
        ? result.results.map(marketplaceProductFromEbayCleanResult)
        : [];
    } catch (error) {
      fallbackReason = error.message || 'Live product API failed';
      result = await searchProductsAcrossProviders({ q, limit, offset }, process.env);
      providerProducts = Array.isArray(result.products) ? result.products : [];
    }
    const products = [];
    for (const product of providerProducts) {
      products.push(await persistMarketplaceProduct(store, product).catch(() => normalizeMarketplaceProduct(product)));
    }
    ok(res, {
      products,
      data: products,
      pagination: {
        limit,
        offset,
        next_offset: offset + products.length,
        has_more: products.length >= limit,
      },
      provider: fallbackReason ? result.provider || '' : 'ebay_browse',
      providerStatus: fallbackReason ? result.providerStatus || result.externalProviderStatus || 'fallback' : 'live',
      fallbackReason,
      productSource: fallbackReason ? 'fallback_catalog' : 'ebay_browse_api',
      totalResults: result.totalResults || products.length,
    });
  }));

  router.get('/prize-catalog', asyncHandler(async (req, res) => {
    const requestedLimit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 500);
    const startOffset = Math.max(Number(req.query.offset) || 0, 0);
    const category = String(req.query.category || '').trim();
    const rawQuery = String(req.query.q || req.query.query || '').trim();
    const q = [rawQuery, category && !rawQuery.toLowerCase().includes(category.toLowerCase()) ? category : '']
      .filter(Boolean)
      .join(' ')
      || 'popular prizes';
    const commonInput = {
      q,
      minPrice: req.query.minPrice ?? req.query.min_price ?? '',
      maxPrice: req.query.maxPrice ?? req.query.max_price ?? '',
      condition: req.query.condition || '',
      buyingOptions: req.query.buyingOptions || req.query.buying_options || '',
    };
    if (/^\d+$/.test(category)) commonInput.category = category;

    const productsByKey = new Map();
    let remaining = requestedLimit;
    let nextOffset = startOffset;
    let totalResults = 0;
    let provider = '';
    let providerStatus = '';

    while (remaining > 0) {
      const pageLimit = Math.min(remaining, 200);
      const result = await searchProductsAcrossProviders({ ...commonInput, limit: pageLimit, offset: nextOffset }, process.env);
      provider = result.provider || provider;
      providerStatus = result.providerStatus || result.externalProviderStatus || providerStatus;
      totalResults = Math.max(totalResults, Number(result.totalResults || 0));

      const providerProducts = Array.isArray(result.products) ? result.products : [];
      for (const product of providerProducts) {
        const normalized = await persistMarketplaceProduct(store, product).catch(() => normalizeMarketplaceProduct(product));
        const image = productImageFromSnapshot(normalized);
        const priceCents = Number(normalized.price_cents || normalized.offers?.[0]?.price_cents || 0);
        if (!image || !priceCents) continue;
        const key = normalized.marketplace_key || productMarketplaceKey(normalized) || normalized.id;
        if (key && !productsByKey.has(key)) productsByKey.set(key, normalized);
      }

      remaining -= pageLimit;
      nextOffset += pageLimit;
      if (providerProducts.length < pageLimit) break;
    }

    const products = [...productsByKey.values()].slice(0, requestedLimit);
    ok(res, {
      success: true,
      total_requested: requestedLimit,
      products,
      data: products,
      pagination: {
        limit: requestedLimit,
        offset: startOffset,
        next_offset: startOffset + requestedLimit,
        has_more: products.length >= requestedLimit && (!totalResults || startOffset + requestedLimit < totalResults),
      },
      provider,
      providerStatus,
      totalResults: totalResults || products.length,
    });
  }));

  router.get('/prize-catalog/rows', asyncHandler(async (req, res) => {
    const rowLimit = Math.min(Math.max(Number(req.query.rowLimit || req.query.limit) || 40, 12), 50);
    const queryOffset = Math.max(Number(req.query.queryOffset || req.query.seed) || 0, 0);
    const rows = [];
    const globalDedupeKeys = new Set();
    let provider = '';
    let providerStatus = '';
    let totalDuplicatesRemoved = 0;

    for (const row of PRIZE_CATALOG_ROWS) {
      const rowProducts = [];
      const rowDedupeKeys = new Set();
      const queryTerms = row.query_terms.map((_, index, terms) => terms[(index + queryOffset) % terms.length]);
      const queryTermsUsed = [];
      const perTermLimit = Math.min(200, Math.max(rowLimit, 50));
      let rawCount = 0;
      let afterSafetyFilterCount = 0;
      let duplicateCountRemoved = 0;

      for (const term of queryTerms) {
        queryTermsUsed.push(term);
        const result = await searchProductsAcrossProviders({
          q: term,
          minPrice: 5,
          maxPrice: 500,
          limit: perTermLimit,
          offset: 0,
        }, process.env);
        provider = result.provider || provider;
        providerStatus = result.providerStatus || result.externalProviderStatus || providerStatus;

        const providerProducts = Array.isArray(result.products) ? result.products : [];
        rawCount += providerProducts.length;
        for (const product of providerProducts) {
          const normalized = await persistMarketplaceProduct(store, product).catch(() => normalizeMarketplaceProduct(product));
          if (!productIsSafePrize(normalized, row)) continue;
          afterSafetyFilterCount += 1;

          const keys = productDedupeKeys(normalized);
          if (!keys.length || keys.some((key) => rowDedupeKeys.has(key) || globalDedupeKeys.has(key))) {
            duplicateCountRemoved += 1;
            continue;
          }

          const score = productPrizeScore(normalized, row);
          rowProducts.push({
            ...normalized,
            title: normalizedPrizeTitle(normalized.title).slice(0, 140),
            category: row.category,
            prize_row_id: row.id,
            prize_row_title: row.title,
            prize_query_terms: row.query_terms,
            prize_score: score,
          });
          keys.forEach((key) => rowDedupeKeys.add(key));
          if (rowProducts.length >= rowLimit) break;
        }
        if (rowProducts.length >= rowLimit) break;
      }

      totalDuplicatesRemoved += duplicateCountRemoved;
      const products = rowProducts
        .sort((a, b) => Number(b.prize_score || 0) - Number(a.prize_score || 0))
        .slice(0, rowLimit);
      products.forEach((product) => productDedupeKeys(product).forEach((key) => globalDedupeKeys.add(key)));
      rows.push({
        id: row.id,
        title: row.title,
        category: row.category,
        query_terms: row.query_terms,
        products,
        debug: {
          query_terms_used: queryTermsUsed,
          provider,
          raw_count: rawCount,
          after_safety_filter_count: afterSafetyFilterCount,
          after_dedupe_count: products.length,
          duplicate_count_removed: duplicateCountRemoved,
          first_titles: products.slice(0, 8).map((product) => product.title),
        },
      });
    }

    const totalProducts = rows.reduce((total, row) => total + row.products.length, 0);
    ok(res, {
      success: true,
      rows,
      data: rows,
      provider,
      providerStatus,
      rowLimit,
      debug: {
        total_rows: rows.length,
        total_products: totalProducts,
        total_duplicates_removed: totalDuplicatesRemoved,
      },
    });
  }));

  router.get('/prize-products/:productId', asyncHandler(async (req, res) => {
    const product = await store.findOne('products', { id: req.params.productId }).catch(() => null);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    ok(res, { product, data: product });
  }));

  router.get('/prize-products/:productId/image', asyncHandler(async (req, res) => proxyMarketplaceProductImage(store, req, res)));

  router.get('/prize-room-templates', asyncHandler(async (_req, res) => {
    await ensureStarterPrizeRoomTemplates(store);
    const templates = await store.list('prize_room_templates', { status: 'active' }, { sort: '-is_featured' }).catch(() => []);
    ok(res, { templates, data: templates });
  }));

  router.get('/prize-rooms', asyncHandler(async (_req, res) => {
    await ensureStarterPrizeRoomTemplates(store);
    const existingRooms = await store.list('prize_rooms', {}, { sort: '-created_at' }).catch(() => []);
    if (!existingRooms.length) {
      const templates = await store.list('prize_room_templates', { status: 'active' }, { sort: '-is_featured' });
      for (const template of templates.slice(0, 10)) {
        await createPrizeRoomRecord(store, {
          template_id: template.id,
          room_type: 'platform_supported',
          title: template.title,
          description: template.description,
        }, { id: 'platform' }).catch(() => null);
      }
    }
    const rooms = await store.list('prize_rooms', {}, { sort: '-created_at' });
    const repairedRooms = [];
    for (const room of rooms) {
      const patch = {};
      const starterTemplate = STARTER_PRIZE_ROOM_TEMPLATE_BY_ID.get(room.template_id);
      if (starterTemplate && ['platform_supported', 'template_based'].includes(room.room_type || '')) {
        for (const key of ['title', 'description', 'prize_title', 'prize_query', 'prize_source', 'game_query', 'winning_rule']) {
          if (room[key] !== starterTemplate[key]) patch[key] = starterTemplate[key];
        }
        if (room.prize_title !== starterTemplate.prize_title) {
          patch.prize_image = starterTemplate.prize_image || defaultPrizeImage(starterTemplate.prize_title);
          patch.prize_snapshot = {
            ...(room.prize_snapshot && typeof room.prize_snapshot === 'object' ? room.prize_snapshot : {}),
            id: room.prize_id || starterTemplate.prize_id,
            title: starterTemplate.prize_title,
            source: starterTemplate.prize_source,
            image: patch.prize_image,
            image_url: patch.prize_image,
            price_cents: room.cost_breakdown?.item_cost_cents || starterTemplate.prize_snapshot?.price_cents || 4000,
            currency: room.cost_breakdown?.currency || 'USD',
          };
        }
      }
      const linkedMatch = (!room.game_image || !room.prize_image || isPrizeRoomFallbackImage(room.game_image) || isPrizeRoomFallbackImage(room.prize_image)) && room.match_id
        ? await store.findOne('north_pole_matches', { id: room.match_id }).catch(() => null)
        : null;
      const snapshotGameImage = gameImageFromSnapshot(room.game_snapshot) || gameImageFromSnapshot(linkedMatch?.game_snapshot);
      const snapshotPrizeImage = prizeImageFromSnapshot(room.prize_snapshot) || prizeImageFromSnapshot(linkedMatch?.prize_snapshot);
      const repairedGameImage = snapshotGameImage || defaultGameImage(room.game_title || linkedMatch?.game_snapshot?.title);
      const repairedPrizeImage = snapshotPrizeImage || defaultPrizeImage(room.prize_title || linkedMatch?.prize_snapshot?.title);
      if (!room.game_image || (snapshotGameImage && isPrizeRoomFallbackImage(room.game_image))) patch.game_image = repairedGameImage;
      if (!room.prize_image || (snapshotPrizeImage && isPrizeRoomFallbackImage(room.prize_image))) patch.prize_image = repairedPrizeImage;
      if (!room.game_query) patch.game_query = room.game_title || linkedMatch?.game_snapshot?.title || '';
      if (!room.prize_query) patch.prize_query = room.prize_title || linkedMatch?.prize_snapshot?.title || '';
      if (room.game_snapshot && typeof room.game_snapshot === 'object' && !gameImageFromSnapshot(room.game_snapshot)) {
        patch.game_snapshot = {
          ...room.game_snapshot,
          image: patch.game_image || room.game_image,
          background_image: patch.game_image || room.game_image,
        };
      } else if (!room.game_snapshot && linkedMatch?.game_snapshot) {
        patch.game_snapshot = {
          ...linkedMatch.game_snapshot,
          image: patch.game_image || room.game_image || snapshotGameImage,
          background_image: patch.game_image || room.game_image || snapshotGameImage,
        };
      }
      if (room.prize_snapshot && typeof room.prize_snapshot === 'object' && !prizeImageFromSnapshot(room.prize_snapshot)) {
        patch.prize_snapshot = {
          ...room.prize_snapshot,
          image: patch.prize_image || room.prize_image,
          image_url: patch.prize_image || room.prize_image,
        };
      } else if (!room.prize_snapshot && linkedMatch?.prize_snapshot) {
        patch.prize_snapshot = {
          ...linkedMatch.prize_snapshot,
          image: patch.prize_image || room.prize_image || snapshotPrizeImage,
          image_url: patch.prize_image || room.prize_image || snapshotPrizeImage,
        };
      }
      let repairedRoom = room;
      if (Object.keys(patch).length) {
        repairedRoom = await store.update('prize_rooms', room.id, patch).catch(() => ({ ...room, ...patch }));
      }
      if (String(process.env.PRIZE_ROOM_AUTO_HYDRATE_IMAGES || '').toLowerCase() === 'true') {
        const hydration = await hydratePrizeRoomProviderImages(store, repairedRoom).catch(() => null);
        repairedRooms.push(hydration?.room || repairedRoom);
      } else {
        repairedRooms.push(repairedRoom);
      }
    }
    const contributions = await store.list('player_contributions', {}, { sort: '-created_at' }).catch(() => []);
    const roomsWithFunding = repairedRooms.map((room) => {
      const roomContributions = contributions.filter((row) => row.room_id === room.id);
      const paidContributions = roomContributions.filter((row) => ['marked_paid', 'paid'].includes(row.status));
      return {
        ...room,
        contributions: roomContributions,
        paid_contribution_count: paidContributions.length,
        contribution_status: paidContributions.length >= Number(room.max_players || 0) ? 'funded' : 'collecting',
      };
    });
    ok(res, { rooms: roomsWithFunding, data: roomsWithFunding });
  }));

  router.post('/prize-rooms', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    const input = createPrizeRoomSchema.parse(req.body || {});
    const room = await createPrizeRoomRecord(store, input, user);
    await createAuditEvent(store, {
      entityType: 'PrizeRoom',
      entityId: room.id,
      matchId: room.match_id,
      userId: user.id,
      action: 'PRIZE_ROOM_CREATED',
      metadata: { paymentMode: room.payment_mode, autoPurchase: false },
    });
    ok(res, { room, data: room });
  }));

  router.post('/prize-rooms/hydrate-provider-images-test', asyncHandler(async (req, res) => {
    const allowed = process.env.NODE_ENV !== 'production' || String(process.env.PRIZE_ROOM_ALLOW_TEST_HYDRATE || '').toLowerCase() === 'true';
    if (!allowed) return res.status(404).json({ success: false, error: 'Not found' });

    const rooms = await store.list('prize_rooms', {}, { sort: '-created_at' }).catch(() => []);
    const details = [];
    let updatedRoomCount = 0;
    let failedRoomCount = 0;
    let ebayImageCount = 0;
    let rawgImageCount = 0;

    for (const room of rooms) {
      try {
        const result = await hydratePrizeRoomProviderImages(store, room);
        if (result.updated) updatedRoomCount += 1;
        if (result.details.errors.length) failedRoomCount += 1;
        if (result.details.saved_prize_image_url) ebayImageCount += 1;
        if (result.details.saved_game_image_url) rawgImageCount += 1;
        details.push(result.details);
      } catch (error) {
        failedRoomCount += 1;
        details.push({
          room_id: room.id,
          title: room.title,
          prize_status: 'failed',
          game_status: 'failed',
          errors: [error.message],
        });
      }
    }

    ok(res, {
      updated_room_count: updatedRoomCount,
      failed_room_count: failedRoomCount,
      ebay_image_count: ebayImageCount,
      rawg_image_count: rawgImageCount,
      details,
      data: {
        updated_room_count: updatedRoomCount,
        failed_room_count: failedRoomCount,
        ebay_image_count: ebayImageCount,
        rawg_image_count: rawgImageCount,
        details,
      },
    });
  }));

  router.get('/prize-rooms/:roomId/prize-image', asyncHandler(async (req, res) => {
    const room = await store.findOne('prize_rooms', { id: req.params.roomId }).catch(() => null);
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    return proxyPrizeRoomImage(res, prizeRoomPrizeImageForProxy(room));
  }));

  router.get('/prize-rooms/:roomId/game-image', asyncHandler(async (req, res) => {
    const room = await store.findOne('prize_rooms', { id: req.params.roomId }).catch(() => null);
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    return proxyPrizeRoomImage(res, prizeRoomGameImageForProxy(room));
  }));

  router.post('/prize-rooms/:roomId/join', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    const input = joinPrizeRoomSchema.parse(req.body || {});
    const room = await store.findOne('prize_rooms', { id: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    if (!['open', 'awaiting_contributions'].includes(room.status)) {
      return res.status(400).json({ success: false, error: 'Prize Room is not open for contributions' });
    }
    const existing = await store.findOne('player_contributions', { room_id: room.id, user_id: user.id }).catch(() => null);
    if (existing) return ok(res, { room, contribution: existing, alreadyJoined: true, data: { room, contribution: existing } });
    const paidContributions = (await store.list('player_contributions', { room_id: room.id }).catch(() => []))
      .filter((row) => ['marked_paid', 'paid'].includes(row.status));
    if (paidContributions.length >= Number(room.max_players || 0)) {
      return res.status(400).json({ success: false, error: 'Prize Room is already full' });
    }

    const paymentMode = input.paymentMode || input.payment_mode || room.payment_mode || 'stripe_test';
    const contribution = await store.create('player_contributions', {
      room_id: room.id,
      match_id: room.match_id || '',
      user_id: user.id,
      user_email: input.userEmail || input.user_email || user.email || '',
      display_name: input.displayName || input.display_name || profileName(user),
      amount_cents: room.cost_breakdown?.per_player_contribution_cents || 0,
      currency: room.cost_breakdown?.currency || 'USD',
      status: 'pending',
      payment_status: 'pending',
      payment_mode: paymentMode,
      payment_provider: paymentMode === 'pilot_manual' ? 'manual_pilot' : 'stripe',
      payment_reference: '',
      paid_at: null,
    });
    await store.create('prize_room_ledger_entries', {
      room_id: room.id,
      match_id: room.match_id || '',
      type: 'player_contribution',
      amount_cents: contribution.amount_cents,
      currency: contribution.currency,
      description: `Player contribution from ${contribution.display_name}`,
      status: contribution.status,
    }).catch(() => null);
    const updatedRoom = await syncRoomStatusFromContributions(store, room);
    let paymentStorageWarning = '';
    await store.list('prize_room_payments', {}, { limit: 1 }).catch(() => {
      paymentStorageWarning = 'Joined room. Payment pending. Stripe storage needs review.';
      return [];
    });
    await createAuditEvent(store, {
      entityType: 'PrizeRoom',
      entityId: room.id,
      matchId: room.match_id,
      userId: user.id,
      action: 'PRIZE_ROOM_JOINED',
      metadata: { contributionId: contribution.id, paymentMode, status: contribution.status, autoCharge: false },
    }).catch(() => null);
    ok(res, {
      room: updatedRoom,
      contribution,
      ...(paymentStorageWarning ? { paymentStorageWarning } : {}),
      data: {
        room: updatedRoom,
        contribution,
        ...(paymentStorageWarning ? { paymentStorageWarning } : {}),
      },
    });
  }));

  router.post('/admin/prize-rooms/:roomId/contributions/:contributionId/mark-paid', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });
    const input = markContributionPaidSchema.parse({ ...req.params, ...(req.body || {}) });
    const room = await store.findOne('prize_rooms', { id: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    const contributionId = input.contributionId || input.contribution_id || req.params.contributionId;
    const contribution = await store.findOne('player_contributions', { id: contributionId });
    if (!contribution) return res.status(404).json({ success: false, error: 'Contribution not found' });
    const updatedContribution = await store.update('player_contributions', contribution.id, {
      status: 'marked_paid',
      paid_at: contribution.paid_at || now(),
      payment_mode: contribution.payment_mode || 'pilot_manual',
      payment_provider: contribution.payment_provider || 'manual_pilot',
      payment_reference: contribution.payment_reference || `ADMIN-PILOT-${Date.now().toString(36).toUpperCase()}`,
    });
    const updatedRoom = await syncRoomStatusFromContributions(store, room);
    ok(res, { room: updatedRoom, contribution: updatedContribution, data: { room: updatedRoom, contribution: updatedContribution } });
  }));

  router.post('/admin/prize-rooms/:roomId/mark-funded', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });
    const room = await store.findOne('prize_rooms', { id: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    const updatedRoom = await store.update('prize_rooms', room.id, {
      status: 'funded',
      funding_status: 'funded',
      manually_funded_by: user.id,
      manually_funded_at: now(),
    });
    if (room.match_id) {
      await store.update('north_pole_matches', room.match_id, { status: 'waiting_for_players' }).catch(() => null);
    }
    ok(res, { room: updatedRoom, data: updatedRoom });
  }));

  router.post('/admin/prize-rooms/:roomId/start-match', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });
    const room = await store.findOne('prize_rooms', { id: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    const updatedRoom = await store.update('prize_rooms', room.id, { status: 'in_progress', started_at: now() });
    if (room.match_id) {
      await store.update('north_pole_matches', room.match_id, { status: 'in_progress', started_at: now() }).catch(() => null);
    }
    ok(res, { room: updatedRoom, data: updatedRoom });
  }));

  router.post('/admin/prize-rooms/:roomId/create-fulfillment', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });
    const room = await store.findOne('prize_rooms', { id: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    const match = room.match_id ? await store.findOne('north_pole_matches', { id: room.match_id }) : null;
    const fulfillmentMatch = {
      ...(match || {}),
      id: match?.id || room.match_id,
      match_id: match?.match_id || room.id,
      prize_room_id: room.id,
      prize_id: room.prize_id,
      prize_snapshot: {
        id: room.prize_id,
        title: room.prize_title,
        image: room.prize_image,
        image_url: room.prize_image,
        source: room.prize_source,
        product_url: room.prize_url,
        price_cents: room.cost_breakdown?.item_cost_cents || 0,
        estimated_tax_cents: room.cost_breakdown?.estimated_tax_cents || 0,
        estimated_shipping_cents: room.cost_breakdown?.estimated_shipping_cents || 0,
      },
      winner_user_id: room.winner_user_id || match?.winner_user_id || match?.winner_id,
      winner_id: room.winner_user_id || match?.winner_user_id || match?.winner_id,
      cost_breakdown: room.cost_breakdown,
      prize_cost_breakdown: room.cost_breakdown,
      payment_mode: room.payment_mode,
      fulfillment_mode: 'manual',
    };
    if (!fulfillmentMatch.winner_user_id) {
      return res.status(400).json({ success: false, error: 'Winner must be locked before fulfillment is created' });
    }
    const fulfillment = await createPrizeFulfillment(store, fulfillmentMatch, user.id);
    const updatedRoom = await store.update('prize_rooms', room.id, {
      status: 'prize_fulfillment',
      prize_fulfillment_id: fulfillment.id,
      fulfillment_status: 'prepared_order_only',
    });
    ok(res, { room: updatedRoom, fulfillment, data: { room: updatedRoom, fulfillment } });
  }));

  router.get('/admin/prize-rooms/provider-image-diagnostics', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    const rooms = await store.list('prize_rooms', {}, { sort: '-created_at' }).catch(() => []);
    const diagnostics = [];
    for (const room of rooms) {
      diagnostics.push(await getPrizeRoomProviderImageDiagnostics(room));
    }

    ok(res, {
      rooms: diagnostics,
      data: diagnostics,
      update_count: diagnostics.filter((entry) => entry.would_update).length,
    });
  }));

  router.post('/admin/prize-rooms/hydrate-provider-images', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });
    const rooms = await store.list('prize_rooms', {}, { sort: '-created_at' }).catch(() => []);
    const details = [];
    let updatedRoomCount = 0;
    let failedRoomCount = 0;
    let ebayImageCount = 0;
    let rawgImageCount = 0;

    for (const room of rooms) {
      try {
        const result = await hydratePrizeRoomProviderImages(store, room);
        if (result.updated) updatedRoomCount += 1;
        if (result.details.errors.length) failedRoomCount += 1;
        if (result.details.saved_prize_image_url) ebayImageCount += 1;
        if (result.details.saved_game_image_url) rawgImageCount += 1;
        details.push(result.details);
      } catch (error) {
        failedRoomCount += 1;
        details.push({
          room_id: room.id,
          title: room.title,
          prize_status: 'failed',
          game_status: 'failed',
          errors: [error.message],
        });
      }
    }

    ok(res, {
      updated_room_count: updatedRoomCount,
      failed_room_count: failedRoomCount,
      ebay_image_count: ebayImageCount,
      rawg_image_count: rawgImageCount,
      details,
      data: {
        updated_room_count: updatedRoomCount,
        failed_room_count: failedRoomCount,
        ebay_image_count: ebayImageCount,
        rawg_image_count: rawgImageCount,
        details,
      },
    });
  }));

  router.get('/admin/fulfillment', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    const fulfillments = await store.list('prize_fulfillments', {}, { sort: '-created_at' });
    const matches = await store.list('north_pole_matches', {}, { sort: '-created_at' }).catch(() => []);
    const fulfillmentMatchIds = new Set(fulfillments.map((row) => String(row.match_id || row.matchId)));
    const readyMatches = matches
      .filter((match) => ['fulfillment_pending', 'winner_verified', 'prize_fulfillment'].includes(match.status))
      .filter((match) => !fulfillmentMatchIds.has(String(publicMatchId(match))))
      .map((match) => ({
        id: match.id,
        match_id: publicMatchId(match),
        match_title: match.title || match.name || match.game_snapshot?.title || match.game_id || publicMatchId(match),
        winner_id: match.winner_user_id || match.winner_id || '',
        prize_title: normalizePrize(match).title,
        status: match.status,
        winner_verification_id: match.winner_verification_id || '',
        winner_verification_status: match.winner_verification_status || '',
        winner_verification_score: match.winner_verification_score ?? 0,
        winner_verification_tier: match.winner_verification_tier || '',
        winner_verification_reason: match.winner_verification_reason || '',
        winner_verification_proof_sources: match.winner_verification_proof_sources || [],
        winner_verification_requires_manual_review: match.winner_verification_requires_manual_review ?? false,
        prize_cost_breakdown: match.prize_cost_breakdown || buildPrizeCostBreakdown(match),
      }));

    ok(res, { fulfillments, readyMatches, data: { fulfillments, readyMatches } });
  }));

  router.get('/admin/fulfillment/:id', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    const fulfillment = await store.findOne('prize_fulfillments', { id: req.params.id });
    if (!fulfillment) return res.status(404).json({ success: false, error: 'Prize fulfillment not found' });

    ok(res, { fulfillment, data: fulfillment });
  }));

  router.post('/admin/fulfillment/demo-order', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    const input = demoFulfillmentOrderSchema.parse(req.body || {});
    let match = null;
    try {
      console.log('[fulfillment:demo] route:start', {
        selectedMatchId: input.matchId || input.match_id || null,
        userId: user.id,
      });
      match = await prepareDemoFulfillmentMatch(store, input.matchId || input.match_id, user.id);
      const marked = await runDemoFulfillment(store, match, user.id);

      await createAuditEvent(store, {
        entityType: 'PrizeFulfillment',
        entityId: marked.id,
        matchId: marked.match_id,
        userId: user.id,
        action: 'PRIZE_FULFILLMENT_DEMO_ORDER_CREATED',
        metadata: {
          demoMode: true,
          testOrder: true,
          provider: 'mock',
          retailerOrderId: marked.retailer_order_id,
          trackingNumber: marked.tracking_number,
          autoPurchase: false,
        },
      });

      console.log('[fulfillment:demo] route:success', {
        matchId: publicMatchId(match),
        fulfillmentId: marked.id,
        retailerOrderId: marked.retailer_order_id,
        trackingNumber: marked.tracking_number,
      });
      ok(res, { match, fulfillment: marked, data: marked });
    } catch (error) {
      console.error('[fulfillment:demo] route:failed', {
        matchId: match ? publicMatchId(match) : null,
        error: error.message,
        stack: error.stack,
      });
      await createAuditEvent(store, {
        entityType: 'PrizeFulfillment',
        entityId: null,
        matchId: match ? publicMatchId(match) : null,
        userId: user.id,
        action: 'PRIZE_FULFILLMENT_DEMO_ORDER_FAILED',
        metadata: {
          demoMode: true,
          testOrder: true,
          provider: 'mock',
          error: error.message,
        },
      }).catch(() => null);

      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Demo fulfillment order failed',
        match: match ? {
          id: match.id,
          match_id: publicMatchId(match),
          winner_id: match.winner_user_id || match.winner_id || null,
        } : null,
      });
    }
  }));

  router.post('/admin/fulfillment/repair-demo-orders', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    console.log('[fulfillment:repair-demo] route:start', { userId: user.id });
    const matches = await store.list('north_pole_matches', {}, { sort: '-created_at' }).catch((error) => {
      console.error('[fulfillment:repair-demo] list matches failed', { error: error.message, stack: error.stack });
      throw error;
    });
    const demoMatches = matches.filter((match) => (
      (match.demo_mode === true || match.test_order === true || String(publicMatchId(match) || '').startsWith('DEMO-'))
      && match.status === 'fulfillment_pending'
    ));
    const created = [];
    const existing = [];
    const errors = [];

    for (const match of demoMatches) {
      const matchId = publicMatchId(match);
      try {
        console.log('[fulfillment:repair-demo] inspect', {
          matchId,
          rowId: matchRowId(match),
          status: match.status,
          winnerId: match.winner_user_id || match.winner_id,
        });
        const existingFulfillment = await store.findOne('prize_fulfillments', { match_id: matchId });
        if (existingFulfillment?.id) {
          existing.push(existingFulfillment);
          if (existingFulfillment.status === 'ordered' && existingFulfillment.retailer_order_id && existingFulfillment.tracking_number) {
            await markDemoFulfillmentOrdered(store, match, existingFulfillment).catch(() => null);
          }
          continue;
        }

        const prepared = await prepareDemoFulfillmentMatch(store, matchId, user.id);
        const fulfillment = await runDemoFulfillment(store, prepared, user.id);
        created.push(fulfillment);
      } catch (error) {
        console.error('[fulfillment:repair-demo] repair failed', {
          matchId,
          error: error.message,
          stack: error.stack,
        });
        errors.push({ match_id: matchId, error: error.message });
      }
    }

    console.log('[fulfillment:repair-demo] route:complete', {
      inspected: demoMatches.length,
      created: created.length,
      existing: existing.length,
      errors: errors.length,
    });

    ok(res, {
      created,
      existing,
      errors,
      data: { created, existing, errors },
    });
  }));

  router.post('/matches/:id/create-fulfillment', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    const match = await findMatch(store, req.params.id);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });

    try {
      const fulfillment = await createPrizeFulfillment(store, match, user.id);
      ok(res, { fulfillment, data: fulfillment });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Could not create fulfillment' });
    }
  }));

  router.patch('/admin/fulfillment/:id', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    const input = updateFulfillmentStatusSchema.parse(req.body || {});
    const fulfillment = await store.findOne('prize_fulfillments', { id: req.params.id });
    if (!fulfillment) return res.status(404).json({ success: false, error: 'Prize fulfillment not found' });

    const pick = (...keys) => {
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(input, key)) return input[key];
      }
      return undefined;
    };
    const status = pick('status') ?? fulfillment.status;
    const shippingStatus = pick('shippingStatus', 'shipping_status')
      ?? (status === 'shipped' ? 'shipped' : status === 'delivered' ? 'delivered' : status === 'cancelled' ? 'cancelled' : fulfillment.shipping_status);
    const patch = {
      status,
      shipping_status: shippingStatus,
      admin_approved: pick('adminApproved', 'admin_approved') ?? fulfillment.admin_approved ?? false,
      winner_name: pick('winnerName', 'winner_name') ?? fulfillment.winner_name ?? '',
      winner_email: pick('winnerEmail', 'winner_email') ?? fulfillment.winner_email ?? '',
      prize_title: pick('prizeTitle', 'prize_title') ?? fulfillment.prize_title ?? '',
      prize_source: pick('prizeSource', 'prize_source') ?? fulfillment.prize_source ?? '',
      prize_url: pick('prizeUrl', 'prize_url') ?? fulfillment.prize_url ?? '',
      prize_image: pick('prizeImage', 'prize_image') ?? fulfillment.prize_image ?? '',
      shipping_name: pick('shippingName', 'shipping_name') ?? fulfillment.shipping_name ?? '',
      shipping_address_line1: pick('shippingAddressLine1', 'shipping_address_line1') ?? fulfillment.shipping_address_line1 ?? '',
      shipping_address_line2: pick('shippingAddressLine2', 'shipping_address_line2') ?? fulfillment.shipping_address_line2 ?? '',
      shipping_city: pick('shippingCity', 'shipping_city') ?? fulfillment.shipping_city ?? '',
      shipping_state: pick('shippingState', 'shipping_state') ?? fulfillment.shipping_state ?? '',
      shipping_zip: pick('shippingZip', 'shipping_zip') ?? fulfillment.shipping_zip ?? '',
      shipping_country: pick('shippingCountry', 'shipping_country') ?? fulfillment.shipping_country ?? '',
      retailer_order_id: pick('retailerOrderId', 'retailer_order_id') ?? fulfillment.retailer_order_id ?? '',
      tracking_number: pick('trackingNumber', 'tracking_number') ?? fulfillment.tracking_number ?? '',
      admin_notes: pick('adminNotes', 'admin_notes') ?? fulfillment.admin_notes ?? '',
    };
    if (patch.admin_approved && status === fulfillment.status && ['pending_admin_approval', 'pending_address'].includes(fulfillment.status)) {
      patch.status = 'ready_to_order';
    }

    const updated = await store.update('prize_fulfillments', fulfillment.id, patch);
    await createAuditEvent(store, {
      entityType: 'PrizeFulfillment',
      entityId: fulfillment.id,
      matchId: fulfillment.match_id,
      userId: user.id,
      action: 'PRIZE_FULFILLMENT_UPDATED',
      metadata: patch,
    });

    ok(res, { fulfillment: updated, data: updated });
  }));

  router.post('/fulfillment/:matchId/create', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;

    const match = await findMatch(store, req.params.matchId);
    if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
    const matchId = publicMatchId(match);
    const lockedVerification = await store.findOne('winner_verifications', { matchId, status: 'locked' });
    const winnerUserId = match.winner_user_id || lockedVerification?.winnerUserId;
    if (!winnerUserId) return res.status(400).json({ success: false, error: 'Winner must be locked before fulfillment is created' });

    const existing = await store.findOne('fulfillment_orders', { matchId });
    if (existing) return ok(res, { fulfillment: existing, data: existing });

    const prize = normalizePrize(match);
    const prizeCostBreakdown = buildPrizeCostBreakdown(match);
    const fulfillment = await store.create('fulfillment_orders', {
      matchId,
      winnerUserId,
      prizeId: prize.prizeId,
      productSource: prize.productSource,
      productUrl: prize.productUrl,
      itemId: prize.itemId,
      title: prize.title,
      price: prize.price,
      currency: prize.currency,
      shippingCost: prize.shippingCost,
      prizeCostBreakdown,
      item_cost_cents: prizeCostBreakdown.item_cost_cents,
      estimated_tax_cents: prizeCostBreakdown.estimated_tax_cents,
      estimated_shipping_cents: prizeCostBreakdown.estimated_shipping_cents,
      fulfillment_reserve_cents: prizeCostBreakdown.fulfillment_reserve_cents,
      platform_or_foundation_amount_cents: prizeCostBreakdown.platform_or_foundation_amount_cents,
      total_required_cents: prizeCostBreakdown.total_required_cents,
      status: prize.productUrl ? 'ready_to_order' : 'pending',
      trackingNumber: '',
      carrier: '',
      orderedAt: null,
      shippedAt: null,
      deliveredAt: null,
    });

    if (matchRowId(match)) {
      await store.update('north_pole_matches', matchRowId(match), {
        status: 'prize_fulfillment',
        fulfillment_order_id: fulfillment.id,
        prize_cost_breakdown: prizeCostBreakdown,
      }).catch(() => null);
    }

    await createAuditEvent(store, {
      entityType: 'FulfillmentOrder',
      entityId: fulfillment.id,
      matchId,
      userId: user.id,
      action: 'FULFILLMENT_ORDER_CREATED',
      metadata: { productSource: fulfillment.productSource, status: fulfillment.status },
    });

    ok(res, { fulfillment, data: fulfillment });
  }));

  router.patch('/fulfillment/:fulfillmentId/status', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });

    const input = updateFulfillmentStatusSchema.parse(req.body || {});
    const fulfillment = await store.findOne('fulfillment_orders', { id: req.params.fulfillmentId });
    if (!fulfillment) return res.status(404).json({ success: false, error: 'Fulfillment order not found' });

    const timestamp = now();
    const patch = {
      status: input.status,
      trackingNumber: input.trackingNumber || input.tracking_number || fulfillment.trackingNumber || '',
      carrier: input.carrier || fulfillment.carrier || '',
    };
    if (input.status === 'ordered') patch.orderedAt = fulfillment.orderedAt || timestamp;
    if (input.status === 'shipped') patch.shippedAt = fulfillment.shippedAt || timestamp;
    if (input.status === 'delivered') patch.deliveredAt = fulfillment.deliveredAt || timestamp;

    const updated = await store.update('fulfillment_orders', fulfillment.id, patch);
    await createAuditEvent(store, {
      entityType: 'FulfillmentOrder',
      entityId: fulfillment.id,
      matchId: fulfillment.matchId,
      userId: user.id,
      action: 'FULFILLMENT_STATUS_UPDATED',
      metadata: patch,
    });

    ok(res, { fulfillment: updated, data: updated });
  }));

  return router;
}
