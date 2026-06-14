import crypto from 'crypto';
import { pathToFileURL } from 'url';
import { processFinancialSettlementTrigger } from './matchFlow.js';

const now = () => new Date().toISOString();

class FixtureStore {
  constructor(seed = {}) {
    this.tables = new Map(Object.entries(seed).map(([table, rows]) => [table, rows.map((row) => ({ ...row }))]));
  }

  table(name) {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name);
  }

  async create(table, data) {
    const row = {
      id: data.id || `${table}_${crypto.randomUUID()}`,
      created_at: data.created_at || now(),
      updated_at: data.updated_at || now(),
      ...data,
    };
    this.table(table).push(row);
    return row;
  }

  async list(table, filters = {}) {
    return this.table(table).filter((row) => Object.entries(filters).every(([key, value]) => row[key] === value));
  }

  async findOne(table, filters = {}) {
    return (await this.list(table, filters))[0] || null;
  }

  async update(table, rowId, patch) {
    const rows = this.table(table);
    const index = rows.findIndex((row) => row.id === rowId);
    if (index === -1) return null;
    rows[index] = { ...rows[index], ...patch, updated_at: now() };
    return rows[index];
  }
}

function baseSeed({ missingFulfillment = false, paymentMismatch = false, openDispute = false, processed = false } = {}) {
  const expected = 5000;
  const triggerStatus = processed ? 'processed' : 'pending_processor_integration';
  return {
    financial_triggers: [{
      id: 'trigger_fixture_settlement',
      type: 'winner_resolution_settlement',
      status: triggerStatus,
      match_id: 'match_fixture_settlement',
      match_row_id: 'match_fixture_settlement',
      prize_room_id: 'room_fixture_settlement',
      winner_user_id: 'user_a',
      winner_verification_id: 'verification_fixture_settlement',
      fulfillment_id: 'fulfillment_fixture_settlement',
      idempotency_key: 'winner_resolution:match_fixture_settlement:user_a:fulfillment_fixture_settlement',
      money_movement_triggered: processed,
      stripe_transfer_id: processed ? 'tr_fixture_existing' : '',
    }],
    north_pole_matches: [{
      id: 'match_fixture_settlement',
      match_id: 'match_fixture_settlement',
      prize_room_id: 'room_fixture_settlement',
      status: 'prize_fulfillment',
      winner_user_id: 'user_a',
    }],
    prize_rooms: [{
      id: 'room_fixture_settlement',
      match_id: 'match_fixture_settlement',
      status: 'prize_fulfillment',
      max_players: 2,
      destination_account_id: 'acct_fixture_creator',
      cost_breakdown: {
        per_player_contribution_cents: 2500,
        total_room_cost_cents: expected,
        currency: 'USD',
      },
    }],
    winner_verifications: [{
      id: 'verification_fixture_settlement',
      matchId: 'match_fixture_settlement',
      winnerUserId: 'user_a',
      status: 'approved',
    }],
    prize_fulfillments: missingFulfillment ? [] : [{
      id: 'fulfillment_fixture_settlement',
      match_id: 'match_fixture_settlement',
      prize_room_id: 'room_fixture_settlement',
      winner_id: 'user_a',
      status: 'pending_address',
    }],
    player_contributions: [
      { id: 'contrib_a', room_id: 'room_fixture_settlement', user_id: 'user_a', status: 'paid', amount_cents: 2500 },
      { id: 'contrib_b', room_id: 'room_fixture_settlement', user_id: 'user_b', status: 'paid', amount_cents: paymentMismatch ? 2000 : 2500 },
    ],
    prize_room_payments: [],
    prize_room_ledger_entries: [{
      id: 'ledger_pending_creator',
      room_id: 'room_fixture_settlement',
      match_id: 'match_fixture_settlement',
      type: 'creator_pending_payout',
      status: 'pending_admin_release',
      amount_cents: 500,
    }],
    match_disputes: openDispute ? [{
      id: 'dispute_fixture_settlement',
      matchId: 'match_fixture_settlement',
      status: 'open',
    }] : [],
    audit_events: [],
  };
}

async function runCase(name, options = {}) {
  const store = new FixtureStore(baseSeed(options));
  const first = await processFinancialSettlementTrigger(store, 'trigger_fixture_settlement', 'system_fixture');
  const second = options.repeat
    ? await processFinancialSettlementTrigger(store, 'trigger_fixture_settlement', 'system_fixture')
    : null;
  return {
    name,
    first,
    second,
    auditEventCount: store.table('audit_events').length,
    trigger: await store.findOne('financial_triggers', { id: 'trigger_fixture_settlement' }),
  };
}

export async function runFinancialSettlementProcessorFixtures() {
  return [
    await runCase('valid_context_stays_pending_without_stripe_settlement'),
    await runCase('missing_fulfillment_blocks', { missingFulfillment: true }),
    await runCase('payment_mismatch_blocks', { paymentMismatch: true }),
    await runCase('open_dispute_blocks', { openDispute: true }),
    await runCase('already_processed_is_idempotent', { processed: true, repeat: true }),
  ];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await runFinancialSettlementProcessorFixtures(), null, 2));
}
