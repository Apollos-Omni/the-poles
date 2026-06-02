import express from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { getRequestUser, ROLES } from '../lib/auth.js';

const ADMIN_ROLES = new Set([ROLES.OWNER, ROLES.ADMIN]);
const PLATFORM_FEE_RATE = 0.10;

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const ok = (res, data = {}) => res.json({ success: true, ...data });
const now = () => new Date().toISOString();

const checkoutSchema = z.object({
  paymentMode: z.enum(['stripe_test', 'stripe_live', 'pilot_manual']).optional(),
  payment_mode: z.enum(['stripe_test', 'stripe_live', 'pilot_manual']).optional(),
}).passthrough();

const creatorPayoutSchema = z.object({
  amountCents: z.number().int().positive().optional(),
  amount_cents: z.number().int().positive().optional(),
  payoutMode: z.enum(['stripe_transfer', 'manual']).optional(),
  payout_mode: z.enum(['stripe_transfer', 'manual']).optional(),
}).passthrough();

function appUrl(env = process.env) {
  return (env.PUBLIC_APP_URL || env.APP_URL || env.FRONTEND_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
}

function stripeSecret(env = process.env) {
  return env.STRIPE_SECRET_KEY || env.STRIPE_TEST_SECRET_KEY || '';
}

function stripeConfigured(env = process.env) {
  return Boolean(stripeSecret(env));
}

function normalizeCents(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : fallback;
}

function appendFormValue(params, key, value) {
  if (value === undefined || value === null) return;
  params.append(key, String(value));
}

async function stripeRequest(path, { method = 'POST', body = {}, env = process.env } = {}) {
  const secret = stripeSecret(env);
  if (!secret) throw new Error('Stripe secret key is not configured. Add STRIPE_SECRET_KEY in test mode first.');

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body || {})) appendFormValue(params, key, value);

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: method === 'GET' ? undefined : params,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Stripe request failed: ${response.status}`;
    const error = new Error(message);
    error.stripe = data?.error || data;
    throw error;
  }
  return data;
}

function parseStripeSignature(header = '') {
  return String(header).split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {});
}

function verifyStripeWebhookSignature(rawBody, signatureHeader, secret) {
  if (!secret) throw new Error('Stripe webhook signing secret is not configured.');
  const parts = parseStripeSignature(signatureHeader);
  if (!parts.t || !parts.v1) throw new Error('Missing Stripe webhook signature parts.');
  const payload = `${parts.t}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const left = Buffer.from(expected, 'hex');
  const right = Buffer.from(parts.v1, 'hex');
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    throw new Error('Invalid Stripe webhook signature.');
  }
}

async function requireUser(req, res, store) {
  const user = await getRequestUser(req, store);
  if (!user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  return user;
}

function isAdmin(user) {
  return ADMIN_ROLES.has(user?.role);
}

async function findOrCreateProfile(store, user) {
  const profile = (store.findProfileByAuthUserId ? await store.findProfileByAuthUserId(user.id).catch(() => null) : null)
    || await store.findOne('profiles', { id: user.id }).catch(() => null)
    || await store.findOne('profiles', { auth_user_id: user.id }).catch(() => null)
    || (user.email ? await store.findOne('profiles', { email: user.email }).catch(() => null) : null);

  if (profile) return profile;
  return store.create('profiles', {
    auth_user_id: user.id,
    email: user.email || '',
    role: user.role || ROLES.USER,
    data: {},
  });
}

async function patchProfileData(store, profile, patch) {
  const data = profile?.data && typeof profile.data === 'object' ? profile.data : {};
  return store.update('profiles', profile.id, { data: { ...data, ...patch } });
}

function profileStripeAccountId(profile) {
  const data = profile?.data && typeof profile.data === 'object' ? profile.data : {};
  return data.stripe_connected_account_id || data.stripe_connect_account_id || profile?.stripe_connected_account_id || '';
}

function buildContributionAllocation(room, contribution) {
  const amount = normalizeCents(contribution.amount_cents);
  const breakdown = room.cost_breakdown || {};
  const totalRoomCost = normalizeCents(breakdown.total_room_cost_cents, amount);
  const ratio = totalRoomCost > 0 ? amount / totalRoomCost : 1;
  const platformFeeCents = normalizeCents(amount * PLATFORM_FEE_RATE);
  const prizeReserveCents = normalizeCents((
    normalizeCents(breakdown.item_cost_cents)
    + normalizeCents(breakdown.estimated_tax_cents)
    + normalizeCents(breakdown.estimated_shipping_cents)
    + normalizeCents(breakdown.fulfillment_reserve_cents)
  ) * ratio);
  const processingReserveCents = normalizeCents(normalizeCents(breakdown.payment_processing_reserve_cents) * ratio);
  const foundationAmountCents = normalizeCents(normalizeCents(breakdown.foundation_amount_cents) * ratio);
  const creatorPendingPayoutCents = Math.max(0, amount - platformFeeCents - prizeReserveCents - processingReserveCents - foundationAmountCents);

  return {
    gross_payment_cents: amount,
    platform_fee_rate: PLATFORM_FEE_RATE,
    platform_fee_cents: platformFeeCents,
    prize_reserve_cents: prizeReserveCents,
    processing_reserve_cents: processingReserveCents,
    foundation_amount_cents: foundationAmountCents,
    creator_pending_payout_cents: creatorPendingPayoutCents,
    currency: contribution.currency || breakdown.currency || 'USD',
  };
}

async function createLedgerEntry(store, entry) {
  return store.create('prize_room_ledger_entries', {
    status: 'planned',
    currency: 'USD',
    created_by_system: 'payments',
    ...entry,
  }).catch(() => null);
}

async function recordContributionAllocation(store, room, contribution, paymentReference = '') {
  const existing = await store.findOne('prize_room_ledger_entries', {
    contribution_id: contribution.id,
    type: 'payment_allocation_summary',
  }).catch(() => null);
  if (existing) return existing;

  const allocation = buildContributionAllocation(room, contribution);
  const base = {
    room_id: room.id,
    match_id: room.match_id || '',
    contribution_id: contribution.id,
    user_id: contribution.user_id,
    payment_reference: paymentReference || contribution.payment_reference || '',
    currency: allocation.currency,
  };

  await createLedgerEntry(store, {
    ...base,
    type: 'payment_collected',
    amount_cents: allocation.gross_payment_cents,
    description: 'Player payment collected for Prize Room.',
    status: 'paid',
  });
  await createLedgerEntry(store, {
    ...base,
    type: 'platform_fee_10_percent',
    amount_cents: allocation.platform_fee_cents,
    description: 'The Poles flat 10% platform fee.',
    status: 'reserved',
  });
  await createLedgerEntry(store, {
    ...base,
    type: 'prize_reserve_allocation',
    amount_cents: allocation.prize_reserve_cents,
    description: 'Prize, tax, shipping, and fulfillment reserve allocation.',
    status: 'reserved',
  });
  await createLedgerEntry(store, {
    ...base,
    type: 'processing_reserve_allocation',
    amount_cents: allocation.processing_reserve_cents,
    description: 'Payment processing reserve allocation.',
    status: 'reserved',
  });
  await createLedgerEntry(store, {
    ...base,
    type: 'foundation_amount_allocation',
    amount_cents: allocation.foundation_amount_cents,
    description: 'Foundation/designated charitable allocation from room formula.',
    status: allocation.foundation_amount_cents > 0 ? 'reserved' : 'not_applicable',
  });
  const summary = await createLedgerEntry(store, {
    ...base,
    type: 'payment_allocation_summary',
    amount_cents: allocation.gross_payment_cents,
    description: 'Summary of directed funds for this player contribution.',
    status: 'recorded',
    allocation,
  });
  await createLedgerEntry(store, {
    ...base,
    type: 'creator_pending_payout',
    amount_cents: allocation.creator_pending_payout_cents,
    description: 'Creator payout amount pending admin release after rules are satisfied.',
    status: allocation.creator_pending_payout_cents > 0 ? 'pending_admin_release' : 'not_applicable',
  });

  return summary;
}

async function syncRoomStatusFromPaidContributions(store, room) {
  const contributions = await store.list('player_contributions', { room_id: room.id }).catch(() => []);
  const paid = contributions.filter((row) => ['marked_paid', 'paid'].includes(row.status));
  const playerIds = [...new Set(paid.map((row) => row.user_id).filter(Boolean).map(String))];
  const targetStatus = paid.length >= Number(room.max_players || 0) ? 'funded' : paid.length > 0 ? 'awaiting_contributions' : 'open';
  const updatedRoom = await store.update('prize_rooms', room.id, {
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
  return updatedRoom;
}

async function markContributionPaid(store, contributionId, patch = {}) {
  const contribution = await store.findOne('player_contributions', { id: contributionId });
  if (!contribution) throw new Error('Contribution not found');
  const room = await store.findOne('prize_rooms', { id: contribution.room_id });
  if (!room) throw new Error('Prize Room not found');

  const updatedContribution = await store.update('player_contributions', contribution.id, {
    status: 'paid',
    payment_mode: contribution.payment_mode || 'stripe_checkout',
    payment_provider: 'stripe',
    paid_at: contribution.paid_at || now(),
    ...patch,
  });
  await recordContributionAllocation(store, room, updatedContribution, patch.payment_reference || patch.stripe_payment_intent_id || '');
  const updatedRoom = await syncRoomStatusFromPaidContributions(store, room);
  return { room: updatedRoom, contribution: updatedContribution };
}

async function findOrCreatePendingContribution(store, room, user, paymentMode) {
  const existing = await store.findOne('player_contributions', { room_id: room.id, user_id: user.id }).catch(() => null);
  if (existing) return existing;
  return store.create('player_contributions', {
    room_id: room.id,
    match_id: room.match_id || '',
    user_id: user.id,
    user_email: user.email || '',
    display_name: user.email || user.id,
    amount_cents: room.cost_breakdown?.per_player_contribution_cents || 0,
    currency: room.cost_breakdown?.currency || 'USD',
    status: paymentMode === 'pilot_manual' ? 'marked_paid' : 'pending_payment',
    payment_mode: paymentMode,
    payment_provider: paymentMode === 'pilot_manual' ? 'manual_pilot' : 'stripe',
    payment_reference: paymentMode === 'pilot_manual' ? `PILOT-${Date.now().toString(36).toUpperCase()}` : '',
    paid_at: paymentMode === 'pilot_manual' ? now() : null,
  });
}

async function sumCreatorPendingPayout(store, roomId) {
  const entries = await store.list('prize_room_ledger_entries', { room_id: roomId, type: 'creator_pending_payout' }).catch(() => []);
  const transferred = await store.list('prize_room_ledger_entries', { room_id: roomId, type: 'creator_payout_transfer' }).catch(() => []);
  const pending = entries.reduce((sum, row) => sum + normalizeCents(row.amount_cents), 0);
  const alreadySent = transferred.reduce((sum, row) => sum + normalizeCents(row.amount_cents), 0);
  return Math.max(0, pending - alreadySent);
}

export function createStripeWebhookHandler({ store, env = process.env } = {}) {
  return asyncHandler(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET || '';
    if (webhookSecret) verifyStripeWebhookSignature(rawBody, req.headers['stripe-signature'] || '', webhookSecret);
    const event = JSON.parse(rawBody.toString('utf8'));

    const duplicate = await store.findOne('audit_logs', { event_id: event.id }).catch(() => null);
    if (duplicate) return ok(res, { received: true, duplicate: true });

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object || {};
      const contributionId = session.metadata?.contribution_id;
      if (contributionId) {
        await markContributionPaid(store, contributionId, {
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent || '',
          payment_reference: session.payment_intent || session.id,
          stripe_payment_status: session.payment_status || 'paid',
        });
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data?.object || {};
      const contributionId = intent.metadata?.contribution_id;
      if (contributionId) {
        const contribution = await store.findOne('player_contributions', { id: contributionId }).catch(() => null);
        if (contribution) {
          await store.update('player_contributions', contribution.id, {
            status: 'payment_failed',
            stripe_payment_intent_id: intent.id,
            stripe_payment_status: intent.status,
            payment_error: intent.last_payment_error?.message || 'Payment failed',
          }).catch(() => null);
        }
      }
    }

    await store.create('audit_logs', {
      event_id: event.id,
      event_type: event.type,
      source: 'stripe_webhook',
      received_at: now(),
      data: { livemode: event.livemode === true },
    }).catch(() => null);

    ok(res, { received: true });
  });
}

export function createPaymentRouter({ store, env = process.env } = {}) {
  const router = express.Router();

  router.get('/config', (_req, res) => {
    ok(res, {
      stripe_configured: stripeConfigured(env),
      publishable_key_configured: Boolean(env.VITE_STRIPE_PUBLISHABLE_KEY || env.STRIPE_PUBLISHABLE_KEY),
      platform_fee_rate: PLATFORM_FEE_RATE,
      mode: env.STRIPE_LIVE_MODE === 'true' ? 'live' : 'test',
    });
  });

  router.post('/connect/onboarding', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    const profile = await findOrCreateProfile(store, user);
    let accountId = profileStripeAccountId(profile);

    if (!stripeConfigured(env)) {
      const simulatedAccountId = accountId || `acct_sim_${user.id}`;
      await patchProfileData(store, profile, {
        stripe_connected_account_id: simulatedAccountId,
        stripe_connect_status: 'simulated_onboarding_ready',
        stripe_connect_mode: 'test_not_configured',
      });
      return ok(res, {
        accountId: simulatedAccountId,
        simulated: true,
        url: `${appUrl(env)}/north-pole?connect=simulated`,
        message: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable real test-mode onboarding.',
      });
    }

    if (!accountId) {
      const account = await stripeRequest('/accounts', {
        env,
        body: {
          type: 'express',
          country: env.STRIPE_CONNECT_COUNTRY || 'US',
          'capabilities[card_payments][requested]': true,
          'capabilities[transfers][requested]': true,
          'business_profile[url]': appUrl(env),
          'business_profile[product_description]': 'Skill-based Prize Room hosting and creator payouts on The Poles.',
          email: user.email || undefined,
        },
      });
      accountId = account.id;
      await patchProfileData(store, profile, {
        stripe_connected_account_id: accountId,
        stripe_connect_status: 'account_created',
        stripe_connect_mode: env.STRIPE_LIVE_MODE === 'true' ? 'live' : 'test',
      });
    }

    const link = await stripeRequest('/account_links', {
      env,
      body: {
        account: accountId,
        type: 'account_onboarding',
        refresh_url: `${appUrl(env)}/north-pole?connect=refresh`,
        return_url: `${appUrl(env)}/north-pole?connect=return`,
      },
    });

    ok(res, { accountId, url: link.url, simulated: false });
  }));

  router.get('/connect/status', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    const profile = await findOrCreateProfile(store, user);
    const accountId = profileStripeAccountId(profile);
    const data = profile?.data && typeof profile.data === 'object' ? profile.data : {};

    if (!accountId || !stripeConfigured(env)) {
      return ok(res, {
        accountId: accountId || '',
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
        status: data.stripe_connect_status || 'not_started',
        simulated: !stripeConfigured(env),
      });
    }

    const account = await stripeRequest(`/accounts/${accountId}`, { method: 'GET', env });
    await patchProfileData(store, profile, {
      stripe_connect_status: account.details_submitted ? 'details_submitted' : 'requirements_due',
      stripe_charges_enabled: account.charges_enabled === true,
      stripe_payouts_enabled: account.payouts_enabled === true,
    });
    ok(res, {
      accountId,
      charges_enabled: account.charges_enabled === true,
      payouts_enabled: account.payouts_enabled === true,
      details_submitted: account.details_submitted === true,
      requirements: account.requirements || {},
      simulated: false,
    });
  }));

  router.post('/prize-rooms/:roomId/checkout', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    const input = checkoutSchema.parse(req.body || {});
    const room = await store.findOne('prize_rooms', { id: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    if (!['open', 'awaiting_contributions'].includes(room.status)) {
      return res.status(400).json({ success: false, error: 'Prize Room is not open for payment.' });
    }

    const paymentMode = input.paymentMode || input.payment_mode || (env.STRIPE_LIVE_MODE === 'true' ? 'stripe_live' : 'stripe_test');
    const contribution = await findOrCreatePendingContribution(store, room, user, paymentMode);
    const amountCents = normalizeCents(contribution.amount_cents || room.cost_breakdown?.per_player_contribution_cents);
    if (amountCents <= 0) return res.status(400).json({ success: false, error: 'Contribution amount is missing.' });

    const allocation = buildContributionAllocation(room, { ...contribution, amount_cents: amountCents });
    await store.update('player_contributions', contribution.id, {
      status: paymentMode === 'pilot_manual' ? 'marked_paid' : 'pending_payment',
      payment_mode: paymentMode,
      payment_provider: paymentMode === 'pilot_manual' ? 'manual_pilot' : 'stripe',
      directed_funds_allocation: allocation,
    });

    if (paymentMode === 'pilot_manual') {
      const result = await markContributionPaid(store, contribution.id, {
        payment_provider: 'manual_pilot',
        payment_reference: contribution.payment_reference || `PILOT-${Date.now().toString(36).toUpperCase()}`,
      });
      return ok(res, { ...result, paymentMode, checkout_url: '', allocation, simulated: true });
    }

    if (!stripeConfigured(env)) {
      const simulatedUrl = `${appUrl(env)}/north-pole?payment=simulated&room=${encodeURIComponent(room.id)}&contribution=${encodeURIComponent(contribution.id)}`;
      const updatedContribution = await store.update('player_contributions', contribution.id, {
        status: 'checkout_ready_simulated',
        payment_url: simulatedUrl,
        stripe_payment_status: 'stripe_not_configured',
      });
      return ok(res, {
        room,
        contribution: updatedContribution,
        checkout_url: simulatedUrl,
        allocation,
        simulated: true,
        message: 'Stripe is not configured. Add STRIPE_SECRET_KEY to create a real test-mode checkout session.',
      });
    }

    const session = await stripeRequest('/checkout/sessions', {
      env,
      body: {
        mode: 'payment',
        success_url: `${appUrl(env)}/north-pole?payment=success&room=${encodeURIComponent(room.id)}&contribution=${encodeURIComponent(contribution.id)}`,
        cancel_url: `${appUrl(env)}/north-pole?payment=cancelled&room=${encodeURIComponent(room.id)}`,
        'line_items[0][price_data][currency]': String(contribution.currency || room.cost_breakdown?.currency || 'USD').toLowerCase(),
        'line_items[0][price_data][unit_amount]': amountCents,
        'line_items[0][price_data][product_data][name]': `${room.title} player contribution`,
        'line_items[0][quantity]': 1,
        'metadata[room_id]': room.id,
        'metadata[match_id]': room.match_id || '',
        'metadata[contribution_id]': contribution.id,
        'metadata[user_id]': user.id,
        'metadata[platform_fee_cents]': allocation.platform_fee_cents,
        'metadata[creator_pending_payout_cents]': allocation.creator_pending_payout_cents,
        'payment_intent_data[metadata][room_id]': room.id,
        'payment_intent_data[metadata][contribution_id]': contribution.id,
        'payment_intent_data[metadata][user_id]': user.id,
        'payment_intent_data[metadata][platform_fee_cents]': allocation.platform_fee_cents,
        'payment_intent_data[metadata][creator_pending_payout_cents]': allocation.creator_pending_payout_cents,
      },
    });

    const updatedContribution = await store.update('player_contributions', contribution.id, {
      stripe_checkout_session_id: session.id,
      stripe_payment_status: session.payment_status || 'unpaid',
      payment_url: session.url || '',
      status: 'checkout_created',
    });

    ok(res, { room, contribution: updatedContribution, checkout_url: session.url, allocation, simulated: false });
  }));

  router.get('/prize-rooms/:roomId/allocation', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    const room = await store.findOne('prize_rooms', { id: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });
    const contributions = await store.list('player_contributions', { room_id: room.id }).catch(() => []);
    const paid = contributions.filter((row) => ['marked_paid', 'paid'].includes(row.status));
    const allocationTotals = paid.reduce((totals, contribution) => {
      const allocation = contribution.directed_funds_allocation || buildContributionAllocation(room, contribution);
      for (const [key, value] of Object.entries(allocation)) {
        if (key.endsWith('_cents')) totals[key] = normalizeCents(totals[key]) + normalizeCents(value);
      }
      return totals;
    }, {});
    ok(res, { room_id: room.id, paid_contribution_count: paid.length, allocation: allocationTotals, contributions: paid });
  }));

  router.post('/admin/prize-rooms/:roomId/creator-payout', asyncHandler(async (req, res) => {
    const user = await requireUser(req, res, store);
    if (!user) return;
    if (!isAdmin(user)) return res.status(403).json({ success: false, error: 'Admin access required' });
    const input = creatorPayoutSchema.parse(req.body || {});
    const room = await store.findOne('prize_rooms', { id: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, error: 'Prize Room not found' });

    const availableCents = await sumCreatorPendingPayout(store, room.id);
    const requestedCents = normalizeCents(input.amountCents || input.amount_cents || availableCents);
    if (requestedCents <= 0 || requestedCents > availableCents) {
      return res.status(400).json({ success: false, error: 'Creator payout amount is not available.' });
    }

    const creatorProfile = room.created_by
      ? await store.findOne('profiles', { auth_user_id: room.created_by }).catch(() => null)
        || await store.findOne('profiles', { id: room.created_by }).catch(() => null)
      : null;
    const destination = profileStripeAccountId(creatorProfile);
    const payoutMode = input.payoutMode || input.payout_mode || (destination && stripeConfigured(env) ? 'stripe_transfer' : 'manual');
    let transfer = null;
    let status = 'pending_manual';

    if (payoutMode === 'stripe_transfer') {
      if (!destination) return res.status(400).json({ success: false, error: 'Creator has not connected Stripe yet.' });
      transfer = await stripeRequest('/transfers', {
        env,
        body: {
          amount: requestedCents,
          currency: String(room.cost_breakdown?.currency || 'USD').toLowerCase(),
          destination,
          description: `Creator payout for ${room.title}`,
          transfer_group: `prize_room_${room.id}`,
          'metadata[room_id]': room.id,
          'metadata[created_by]': room.created_by || '',
        },
      });
      status = 'sent';
    }

    const ledger = await createLedgerEntry(store, {
      room_id: room.id,
      match_id: room.match_id || '',
      type: 'creator_payout_transfer',
      amount_cents: requestedCents,
      currency: room.cost_breakdown?.currency || 'USD',
      description: payoutMode === 'stripe_transfer' ? 'Creator payout sent through Stripe transfer.' : 'Creator payout marked for manual release.',
      status,
      stripe_transfer_id: transfer?.id || '',
      destination_account_id: destination || '',
      approved_by: user.id,
      approved_at: now(),
    });
    const updatedRoom = await store.update('prize_rooms', room.id, {
      creator_payout_status: status,
      creator_payout_last_amount_cents: requestedCents,
      creator_payout_last_at: now(),
    });

    ok(res, { room: updatedRoom, ledger, transfer, payoutMode, available_before_payout_cents: availableCents });
  }));

  return router;
}
