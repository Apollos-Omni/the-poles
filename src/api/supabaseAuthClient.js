import { createClient } from '@supabase/supabase-js';

const authMode = import.meta.env.VITE_AUTH_MODE || 'demo';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseAuthMode = authMode === 'supabase';
export const isSupabaseAuthConfigured = Boolean(isSupabaseAuthMode && supabaseUrl && supabaseAnonKey);

let supabaseClient = null;

function getSupabaseClient() {
  if (!isSupabaseAuthConfigured) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

export async function getSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.auth.getSession();
  if (error) {
    console.warn('[supabaseAuth] getSession failed:', error.message);
    return null;
  }

  return data.session || null;
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}

export async function signUp(email, password, metadata = {}) {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: null };

  return client.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
}

export async function signInWithPassword(email, password) {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: null };

  return client.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: null };

  return client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut() {
  const client = getSupabaseClient();
  if (!client) return { error: null };

  return client.auth.signOut();
}

export async function exchangeCodeForSession() {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: null };

  return client.auth.exchangeCodeForSession(window.location.href);
}

export function getMfaApi() {
  const client = getSupabaseClient();
  return client?.auth?.mfa || null;
}

export function onAuthStateChange(callback) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    };
  }

  return client.auth.onAuthStateChange(callback);
}
