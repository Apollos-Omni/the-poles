import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const now = () => new Date().toISOString();
const id = (prefix = '') => `${prefix}${crypto.randomUUID()}`;
const OWNER_ROLES = new Set(['owner', 'admin']);
const VALID_PROFILE_ROLES = new Set(['owner', 'admin', 'moderator', 'affiliate_manager', 'user']);
const FLEXIBLE_ENTITY_TABLES = new Set([
  'profiles',
  'products',
  'prizes',
  'games',
  'matches',
  'match_entries',
  'match_scores',
  'scores',
  'fulfillments',
  'fulfillment_orders',
  'fulfillment_events',
  'affiliate_merchants',
  'affiliate_offers',
  'affiliate_clicks',
  'affiliate_applications',
  'donations',
  'audit_logs',
  'north_pole_matches',
  'north_pole_fulfillments',
  'score_submissions',
  'match_evidence',
  'winner_verifications',
  'referee_accounts',
  'match_referee_sessions',
  'referee_reports',
  'match_disputes',
  'fulfillment_intents',
  'purchase_intents',
  'match_events',
  'user_match_entities',
  'south_pole_challenges',
  'campaign_contributions',
  'campaign_events',
  'campaign_players',
  'team_prize_pools',
  'team_prize_campaigns',
  'mission_contributions',
  'mission_ledger_entries',
  'sponsor_packages',
  'partner_inquiries',
]);

function normalizeInsert(data) {
  return { id: data.id || id(), created_at: data.created_at || now(), updated_at: data.updated_at || now(), ...data };
}

function matchesFilters(row, filters = {}) {
  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined) return true;
    if (Array.isArray(value)) return value.includes(row[key]);
    return row[key] === value;
  });
}

function applySortAndLimit(rows, sort, limit) {
  const sorted = sort && typeof sort === 'string'
    ? [...rows].sort((a, b) => {
      const desc = sort.startsWith('-');
      const key = desc ? sort.slice(1) : sort;
      const av = a?.[key] ?? '';
      const bv = b?.[key] ?? '';
      const result = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return desc ? -result : result;
    })
    : rows;

  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

function toFlexibleRow(data = {}) {
  const row = normalizeInsert(data);
  const { id: rowId, created_at, updated_at, created_date, updated_date, data: nestedData, ...rest } = row;
  return {
    id: rowId,
    created_at,
    updated_at,
    data: {
      ...rest,
      ...(nestedData && typeof nestedData === 'object' ? nestedData : {}),
      created_date: created_date || created_at,
      updated_date: updated_date || updated_at,
    },
  };
}

function fromFlexibleRow(row) {
  if (!row) return row;
  const data = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...data,
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_date: data.created_date || row.created_at,
    updated_date: data.updated_date || row.updated_at,
  };
}

function normalizeProfileRow(row) {
  if (!row) return row;
  const flexible = fromFlexibleRow(row);
  return {
    ...flexible,
    auth_user_id: row.auth_user_id ?? flexible.auth_user_id ?? null,
    email: row.email ?? flexible.email ?? null,
    role: row.role ?? flexible.role ?? 'user',
    data: row.data && typeof row.data === 'object' ? row.data : flexible.data || {},
  };
}

function profileDataFromAuthUser(authUser = {}) {
  const meta = {
    ...(authUser.user_metadata && typeof authUser.user_metadata === 'object' ? authUser.user_metadata : {}),
    ...(authUser.app_metadata && typeof authUser.app_metadata === 'object' ? authUser.app_metadata : {}),
  };
  const data = {};
  for (const key of ['name', 'full_name', 'avatar_url']) {
    if (typeof meta[key] === 'string' && meta[key]) data[key] = meta[key];
  }
  return data;
}

function isOwnerEmail(email) {
  return Boolean(process.env.OWNER_EMAIL && email?.toLowerCase() === process.env.OWNER_EMAIL.toLowerCase());
}

function roleForProfile(profile, email) {
  if (isOwnerEmail(email)) return 'owner';
  return VALID_PROFILE_ROLES.has(profile?.role) ? profile.role : 'user';
}

class MemoryStore {
  constructor() {
    this.kind = 'memory';
    this.tables = new Map();
  }

  table(name) {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name);
  }

  async create(table, data) {
    const row = normalizeInsert(data);
    this.table(table).push(row);
    return row;
  }

  async bulkCreate(table, rows) {
    const out = [];
    for (const row of rows) out.push(await this.create(table, row));
    return out;
  }

  async list(table, filters = {}, options = {}) {
    const rows = this.table(table).filter((row) => matchesFilters(row, filters));
    return applySortAndLimit(rows, options.sort, options.limit);
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

  async delete(table, rowId) {
    const rows = this.table(table);
    const index = rows.findIndex((row) => row.id === rowId);
    if (index === -1) return null;
    const [deleted] = rows.splice(index, 1);
    return deleted;
  }

  async findProfileByAuthUserId(authUserId) {
    return this.findOne('profiles', { auth_user_id: authUserId });
  }

  async findProfileByEmail(email) {
    return this.findOne('profiles', { email });
  }

  async upsertProfileForAuthUser(authUser) {
    const authUserId = authUser?.id;
    const email = authUser?.email || null;
    if (!authUserId) throw new Error('Missing auth user id');

    const existingByAuth = await this.findProfileByAuthUserId(authUserId);
    const existing = existingByAuth || (email ? await this.findProfileByEmail(email) : null);
    const role = roleForProfile(existing, email);
    const base = {
      auth_user_id: authUserId,
      email,
      role,
      data: {
        ...(existing?.data && typeof existing.data === 'object' ? existing.data : {}),
        ...profileDataFromAuthUser(authUser),
      },
    };

    if (existing) return this.update('profiles', existing.id, base);
    return this.create('profiles', base);
  }

  async updateProfileSafeFields(profileId, fields = {}) {
    const existing = await this.findOne('profiles', { id: profileId });
    if (!existing) return null;
    const data = existing.data && typeof existing.data === 'object' ? existing.data : {};
    return this.update('profiles', profileId, { data: { ...data, ...fields } });
  }

  async updateUserRole(profileId, role) {
    if (!VALID_PROFILE_ROLES.has(role)) throw new Error('Invalid role');
    const existing = await this.findOne('profiles', { id: profileId });
    if (!existing) return null;
    if (isOwnerEmail(existing.email) && !OWNER_ROLES.has(role)) {
      throw new Error('Cannot downgrade OWNER_EMAIL profile below admin');
    }
    return this.update('profiles', profileId, { role });
  }
}

class SupabaseStore {
  constructor(client) {
    this.kind = 'supabase';
    this.client = client;
  }

  async authUserFromToken(token) {
    const { data, error } = await this.client.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }

  async create(table, data) {
    const payload = FLEXIBLE_ENTITY_TABLES.has(table) ? toFlexibleRow(data) : normalizeInsert(data);
    const { data: row, error } = await this.client.from(table).insert(payload).select('*').single();
    if (error) throw error;
    return FLEXIBLE_ENTITY_TABLES.has(table) ? fromFlexibleRow(row) : row;
  }

  async bulkCreate(table, rows) {
    const payload = rows.map((row) => (FLEXIBLE_ENTITY_TABLES.has(table) ? toFlexibleRow(row) : normalizeInsert(row)));
    const { data, error } = await this.client.from(table).insert(payload).select('*');
    if (error) throw error;
    return FLEXIBLE_ENTITY_TABLES.has(table) ? (data || []).map(fromFlexibleRow) : data || [];
  }

  async list(table, filters = {}, options = {}) {
    let query = this.client.from(table).select('*');
    const flexible = FLEXIBLE_ENTITY_TABLES.has(table);
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined) continue;
      if (flexible && !['id', 'created_at', 'updated_at'].includes(key)) {
        query = Array.isArray(value) ? query.in(`data->>${key}`, value.map(String)) : query.eq(`data->>${key}`, String(value));
      } else {
        query = Array.isArray(value) ? query.in(key, value) : query.eq(key, value);
      }
    }
    if (!flexible && options.sort && typeof options.sort === 'string') {
      const ascending = !options.sort.startsWith('-');
      const column = ascending ? options.sort : options.sort.slice(1);
      query = query.order(column, { ascending });
    }
    if (!flexible && typeof options.limit === 'number') query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) throw error;
    const rows = flexible ? (data || []).map(fromFlexibleRow) : data || [];
    return flexible ? applySortAndLimit(rows, options.sort, options.limit) : rows;
  }

  async findOne(table, filters = {}) {
    const rows = await this.list(table, filters);
    return rows[0] || null;
  }

  async update(table, rowId, patch) {
    if (FLEXIBLE_ENTITY_TABLES.has(table)) {
      const existing = await this.findOne(table, { id: rowId });
      if (!existing) return null;
      const payload = toFlexibleRow({ ...existing, ...patch, id: rowId, updated_at: now() });
      const { data, error } = await this.client
        .from(table)
        .update({ data: payload.data, updated_at: payload.updated_at })
        .eq('id', rowId)
        .select('*')
        .single();
      if (error) throw error;
      return fromFlexibleRow(data);
    }

    const { data, error } = await this.client
      .from(table)
      .update({ ...patch, updated_at: now() })
      .eq('id', rowId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async delete(table, rowId) {
    const { data, error } = await this.client
      .from(table)
      .delete()
      .eq('id', rowId)
      .select('*')
      .single();
    if (error) throw error;
    return FLEXIBLE_ENTITY_TABLES.has(table) ? fromFlexibleRow(data) : data;
  }

  async findProfileByAuthUserId(authUserId) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (error) throw error;
    return normalizeProfileRow(data);
  }

  async findProfileByEmail(email) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return normalizeProfileRow(data);
  }

  async upsertProfileForAuthUser(authUser) {
    const authUserId = authUser?.id;
    const email = authUser?.email || null;
    if (!authUserId) throw new Error('Missing auth user id');

    const existingByAuth = await this.findProfileByAuthUserId(authUserId);
    const existing = existingByAuth || (email ? await this.findProfileByEmail(email) : null);
    const role = roleForProfile(existing, email);
    const existingData = existing?.data && typeof existing.data === 'object' ? existing.data : {};
    const payload = {
      auth_user_id: authUserId,
      email,
      role,
      data: {
        ...existingData,
        ...profileDataFromAuthUser(authUser),
      },
      updated_at: now(),
    };

    if (existing) {
      const { data, error } = await this.client
        .from('profiles')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      return normalizeProfileRow(data);
    }

    const { data, error } = await this.client
      .from('profiles')
      .insert({ id: id(), ...payload, created_at: now() })
      .select('*')
      .single();
    if (error) throw error;
    return normalizeProfileRow(data);
  }

  async updateProfileSafeFields(profileId, fields = {}) {
    const existing = await this.findOne('profiles', { id: profileId });
    if (!existing) return null;
    const data = existing.data && typeof existing.data === 'object' ? existing.data : {};
    const { data: row, error } = await this.client
      .from('profiles')
      .update({ data: { ...data, ...fields }, updated_at: now() })
      .eq('id', profileId)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeProfileRow(row);
  }

  async updateUserRole(profileId, role) {
    if (!VALID_PROFILE_ROLES.has(role)) throw new Error('Invalid role');
    const { data: existingRow, error: existingError } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .maybeSingle();
    if (existingError) throw existingError;
    const existing = normalizeProfileRow(existingRow);
    if (!existing) return null;
    if (isOwnerEmail(existing.email) && !OWNER_ROLES.has(role)) {
      throw new Error('Cannot downgrade OWNER_EMAIL profile below admin');
    }
    const { data, error } = await this.client
      .from('profiles')
      .update({ role, updated_at: now() })
      .eq('id', profileId)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeProfileRow(data);
  }
}

export function createStore() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('[store] Supabase env not configured. Using in-memory store for local dev only.');
    return new MemoryStore();
  }

  return new SupabaseStore(createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}
