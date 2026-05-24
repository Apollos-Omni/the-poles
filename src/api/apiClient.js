import { getAccessToken } from './supabaseAuthClient';

const trimSlash = (value = '') => value.replace(/\/$/, '');
const apiBase = trimSlash(import.meta.env.VITE_API_BASE_URL || '');

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${normalized}`;
}

async function parseJsonResponse(response) {
  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const message = payload.error || payload.message || `Request failed with HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function requestHeaders(body, headers = {}) {
  const token = await getAccessToken();
  return {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(apiUrl(path), {
    method,
    headers: await requestHeaders(body, headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  return parseJsonResponse(response);
}

export async function apiRaw(path, { method = 'GET', body, headers = {} } = {}) {
  return fetch(apiUrl(path), {
    method,
    headers: await requestHeaders(body, headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
}

export async function invokeBackendFunction(name, data = {}) {
  const payload = await apiRequest(`/api/functions/${name}`, {
    method: 'POST',
    body: data,
  });
  return { data: payload };
}

export async function callBackendFunction(name, options = {}) {
  const payload = await apiRequest(`/api/functions/${name}`, options);
  return { data: payload };
}

export function functionUrl(name) {
  return apiUrl(`/api/functions/${name}`);
}
