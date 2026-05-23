import { apiRequest, invokeBackendFunction } from './apiClient';
import { getSession, isSupabaseAuthConfigured, isSupabaseAuthMode, signOut as supabaseSignOut } from './supabaseAuthClient';

const isBrowser = typeof window !== 'undefined';
const memoryStorage = new Map();
const warned = new Set();

const warnOnce = (key, message, details) => {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(message, details || '');
};

const now = () => new Date().toISOString();
const demoUserStorageKey = 'the_poles_demo_user';
const legacyProfileStorageKey = 'poles_profile';
const makeId = (entityName) => {
  const random = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `${entityName}_${random}`;
};

const storageKey = (entityName) => `the_poles_demo_entity_${entityName}`;

const readRows = (entityName) => {
  if (!isBrowser) return memoryStorage.get(entityName) || [];

  try {
    const raw = window.localStorage.getItem(storageKey(entityName));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    warnOnce(`entity-storage-read-${entityName}`, `[base44:entity:${entityName}] Falling back to memory storage.`, error);
    return memoryStorage.get(entityName) || [];
  }
};

const writeRows = (entityName, rows) => {
  memoryStorage.set(entityName, rows);
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(storageKey(entityName), JSON.stringify(rows));
  } catch (error) {
    warnOnce(`entity-storage-write-${entityName}`, `[base44:entity:${entityName}] Could not persist demo data to localStorage.`, error);
  }
};

const normalizeRow = (entityName, data = {}) => {
  const timestamp = now();
  return {
    id: data.id || makeId(entityName),
    created_date: data.created_date || data.created_at || timestamp,
    updated_date: data.updated_date || data.updated_at || timestamp,
    created_at: data.created_at || data.created_date || timestamp,
    updated_at: data.updated_at || data.updated_date || timestamp,
    ...data,
  };
};

const matchesFilters = (row, filters = {}) => Object.entries(filters || {}).every(([key, value]) => {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.includes(row[key]);
  return row[key] === value;
});

const sortRows = (rows, sort) => {
  if (!sort || typeof sort !== 'string') return rows;
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const av = a?.[key] ?? '';
    const bv = b?.[key] ?? '';
    const result = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return desc ? -result : result;
  });
};

async function tryBackendEntity(method, entityName, payload) {
  const functionName = `entity${method[0].toUpperCase()}${method.slice(1)}`;
  try {
    const response = await invokeBackendFunction(functionName, { entity: entityName, entityName, ...payload });
    return response?.data?.data ?? response?.data?.rows ?? response?.data?.row ?? response?.data;
  } catch (error) {
    const missingRoute = /Route not found|HTTP 404|not found/i.test(error?.message || '');
    warnOnce(
      `entity-backend-${functionName}`,
      `[base44:entity] Backend function "${functionName}" is unavailable; using local demo storage.`,
      missingRoute ? undefined : error
    );
    return undefined;
  }
}

function syncAuthFromEntityWrite(entityName, data) {
  if (entityName !== 'Profile' || !data || typeof data !== 'object') return data;
  const userPatch = userFieldsFromProfile(data);
  if (Object.keys(userPatch).length) persistDemoUser(userPatch);
  return data;
}

function createEntity(entityName) {
  return {
    async list(sort, limit) {
      const backend = await tryBackendEntity('list', entityName, { sort, limit });
      if (Array.isArray(backend)) return backend;

      const rows = sortRows(readRows(entityName), sort);
      return typeof limit === 'number' ? rows.slice(0, limit) : rows;
    },

    async filter(filters = {}, sort, limit) {
      const backend = await tryBackendEntity('filter', entityName, { filters, sort, limit });
      if (Array.isArray(backend)) return backend;

      const rows = sortRows(readRows(entityName).filter((row) => matchesFilters(row, filters)), sort);
      return typeof limit === 'number' ? rows.slice(0, limit) : rows;
    },

    async get(id) {
      const backend = await tryBackendEntity('get', entityName, { id });
      if (backend !== undefined) return backend;
      return readRows(entityName).find((row) => row.id === id) || null;
    },

    async create(data = {}) {
      const backend = await tryBackendEntity('create', entityName, { data });
      if (backend !== undefined) return syncAuthFromEntityWrite(entityName, backend);

      const rows = readRows(entityName);
      const row = normalizeRow(entityName, data);
      writeRows(entityName, [...rows, row]);
      return syncAuthFromEntityWrite(entityName, row);
    },

    async update(id, patch = {}) {
      const backend = await tryBackendEntity('update', entityName, { id, patch });
      if (backend !== undefined) return syncAuthFromEntityWrite(entityName, backend);

      const rows = readRows(entityName);
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) {
        warnOnce(`entity-update-missing-${entityName}`, `[base44:entity:${entityName}] Update target missing in local demo storage.`);
        return null;
      }

      const updated = normalizeRow(entityName, { ...rows[index], ...patch, updated_date: now(), updated_at: now() });
      const next = [...rows];
      next[index] = updated;
      writeRows(entityName, next);
      return syncAuthFromEntityWrite(entityName, updated);
    },

    async delete(id) {
      const backend = await tryBackendEntity('delete', entityName, { id });
      if (backend !== undefined) return backend;

      const rows = readRows(entityName);
      writeRows(entityName, rows.filter((row) => row.id !== id));
      return { success: true, id };
    },

    async bulkCreate(items = []) {
      const backend = await tryBackendEntity('bulkCreate', entityName, { data: items });
      if (Array.isArray(backend)) return backend.map((row) => syncAuthFromEntityWrite(entityName, row));

      const rows = readRows(entityName);
      const created = items.map((item) => normalizeRow(entityName, item));
      writeRows(entityName, [...rows, ...created]);
      return created.map((row) => syncAuthFromEntityWrite(entityName, row));
    },
  };
}

const demoUser = {
  id: 'demo-user',
  email: 'demo@thepoles.local',
  full_name: 'Demo User',
  name: 'Demo User',
  role: 'owner',
};

const normalizeDemoUser = (user = {}) => {
  const timestamp = now();
  const fullName = user.full_name || user.name || user.displayName || demoUser.full_name;
  return {
    ...demoUser,
    ...user,
    id: user.id || demoUser.id,
    email: user.email || demoUser.email,
    full_name: fullName,
    name: user.name || fullName,
    created_date: user.created_date || user.created_at || demoUser.created_date || timestamp,
    updated_date: user.updated_date || user.updated_at || timestamp,
    created_at: user.created_at || user.created_date || demoUser.created_at || timestamp,
    updated_at: user.updated_at || user.updated_date || timestamp,
  };
};

const readJsonStorage = (key) => {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    warnOnce(`storage-read-${key}`, `[base44:auth] Could not read ${key} from localStorage.`, error);
    return null;
  }
};

const writeJsonStorage = (key, value) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    warnOnce(`storage-write-${key}`, `[base44:auth] Could not write ${key} to localStorage.`, error);
  }
};

const profileFieldsFromUser = (user = {}) => {
  const out = {};
  if (user.full_name !== undefined || user.name !== undefined || user.displayName !== undefined) {
    out.displayName = user.displayName || user.full_name || user.name;
  }
  if (user.bio !== undefined) out.bio = user.bio;
  if (user.region !== undefined) out.region = user.region;
  if (user.location !== undefined) out.location = user.location;
  if (user.links !== undefined) out.links = user.links;
  if (user.avatar_url !== undefined) out.avatar_url = user.avatar_url;
  if (user.email !== undefined) out.email = user.email;
  return out;
};

const userFieldsFromProfile = (profile = {}) => {
  const out = {};
  if (profile.displayName !== undefined || profile.full_name !== undefined || profile.name !== undefined) {
    const fullName = profile.full_name || profile.name || profile.displayName;
    out.full_name = fullName;
    out.name = profile.name || fullName;
  }
  if (profile.email !== undefined) out.email = profile.email;
  if (profile.bio !== undefined) out.bio = profile.bio;
  if (profile.region !== undefined) out.region = profile.region;
  if (profile.location !== undefined) out.location = profile.location;
  if (profile.links !== undefined) out.links = profile.links;
  if (profile.avatar_url !== undefined) out.avatar_url = profile.avatar_url;
  return out;
};

const readDemoUser = () => {
  const stored = readJsonStorage(demoUserStorageKey);
  const profile = readJsonStorage(legacyProfileStorageKey);
  return normalizeDemoUser({
    ...stored,
    ...userFieldsFromProfile(profile || {}),
  });
};

const persistDemoUser = (patch = {}) => {
  const updated = normalizeDemoUser({
    ...readDemoUser(),
    ...patch,
    updated_date: now(),
    updated_at: now(),
  });
  writeJsonStorage(demoUserStorageKey, updated);

  const profilePatch = profileFieldsFromUser(updated);
  if (Object.keys(profilePatch).length) {
    const currentProfile = readJsonStorage(legacyProfileStorageKey) || {};
    writeJsonStorage(legacyProfileStorageKey, {
      ...currentProfile,
      ...profilePatch,
      updated_date: updated.updated_date,
      updated_at: updated.updated_at,
    });
  }

  Object.assign(demoUser, updated);
  return updated;
};

const normalizeBackendUser = (payload = {}) => {
  const user = payload.user || {};
  const profile = payload.profile || {};
  const data = profile.data && typeof profile.data === 'object' ? profile.data : {};
  const fullName = user.full_name || profile.full_name || data.full_name || user.name || profile.name || data.name || '';

  return {
    ...data,
    ...profile,
    ...user,
    id: user.id || profile.id,
    email: user.email || profile.email,
    role: user.role || profile.role || 'user',
    full_name: fullName,
    name: user.name || profile.name || fullName,
    created_date: profile.created_date || profile.created_at,
    updated_date: profile.updated_date || profile.updated_at,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
};

async function backendMe() {
  if (!isSupabaseAuthConfigured) {
    const error = new Error('Supabase auth is not configured.');
    error.status = 503;
    throw error;
  }

  const session = await getSession();
  if (!session) {
    const error = new Error('Authentication required');
    error.status = 401;
    throw error;
  }

  const payload = await apiRequest('/api/auth/me');
  return normalizeBackendUser(payload);
}

async function backendUpdateMe(patch = {}) {
  if (!isSupabaseAuthConfigured) {
    const error = new Error('Supabase auth is not configured.');
    error.status = 503;
    throw error;
  }

  const payload = await apiRequest('/api/auth/me', {
    method: 'PATCH',
    body: patch,
  });
  return normalizeBackendUser(payload);
}

const auth = {
  async me() {
    if (isSupabaseAuthMode) {
      return backendMe();
    }

    warnOnce('auth-demo', '[base44:auth] Using local demo auth. Wire real auth through the backend before production.');
    return readDemoUser();
  },

  async get(id) {
    warnOnce('auth-get-demo', '[base44:auth] User.get() is using local demo auth data.');
    const user = readDemoUser();
    return { ...user, id: id || user.id };
  },

  async updateMyUserData(patch = {}) {
    if (isSupabaseAuthMode) {
      return backendUpdateMe(patch);
    }

    warnOnce('auth-update-demo', '[base44:auth] updateMyUserData() is stored locally for demo use only.');
    return persistDemoUser(patch);
  },

  async update(id, patch = {}) {
    warnOnce('auth-update-demo', '[base44:auth] User.update() is stored locally for demo use only.');
    const user = readDemoUser();
    if (id && id !== user.id) return { ...user, id, ...patch, updated_date: now(), updated_at: now() };
    return persistDemoUser(patch);
  },

  async logout(redirectUrl) {
    if (isSupabaseAuthMode) {
      await supabaseSignOut();
      if (isBrowser && redirectUrl) window.location.href = redirectUrl;
      return { success: true };
    }

    warnOnce('auth-logout-demo', '[base44:auth] Demo logout clears local auth only.');
    if (isBrowser) {
      window.localStorage.removeItem('base44_access_token');
      if (redirectUrl) window.location.href = redirectUrl;
    }
    return { success: true };
  },

  redirectToLogin(returnUrl) {
    warnOnce('auth-login-demo', '[base44:auth] Login redirect is not wired; continuing with local demo auth.', { returnUrl });
    return null;
  },

  async loginWithRedirect(returnUrl) {
    warnOnce('auth-login-with-redirect-demo', '[base44:auth] loginWithRedirect() is not wired; continuing with local demo auth.', { returnUrl });
    return readDemoUser();
  },
};

const integrationStub = (name, result) => async (...args) => {
  warnOnce(`integration-${name}`, `[base44:integrations] ${name} is not wired locally; returning demo response.`, args[0]);
  return typeof result === 'function' ? result(...args) : result;
};

const Core = {
  InvokeLLM: integrationStub('InvokeLLM', { response: '', text: '', provider: 'demo' }),
  SendEmail: integrationStub('SendEmail', { success: true, provider: 'demo' }),
  SendSMS: integrationStub('SendSMS', { success: true, provider: 'demo' }),
  UploadFile: integrationStub('UploadFile', (file) => ({
    file_url: file?.name ? `demo-upload://${encodeURIComponent(file.name)}` : 'demo-upload://file',
    url: file?.name ? `demo-upload://${encodeURIComponent(file.name)}` : 'demo-upload://file',
    provider: 'demo',
  })),
  GenerateImage: integrationStub('GenerateImage', { url: '', provider: 'demo' }),
  ExtractDataFromUploadedFile: integrationStub('ExtractDataFromUploadedFile', { data: {}, provider: 'demo' }),
};

export const base44 = {
  entities: new Proxy({}, {
    get(target, entityName) {
      if (typeof entityName !== 'string') return target[entityName];
      if (!target[entityName]) target[entityName] = createEntity(entityName);
      return target[entityName];
    },
  }),
  auth,
  functions: {
    invoke: invokeBackendFunction,
  },
  integrations: {
    Core,
  },
  appLogs: {
    async logUserInApp(pageName) {
      warnOnce('appLogs-demo', '[base44:appLogs] App logging is not wired locally; dropping navigation log events.');
      return { success: true, pageName };
    },
  },
};

base44.asServiceRole = base44;
