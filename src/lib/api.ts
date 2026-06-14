import { buildContextQuery } from './context.ts';

type JsonRecord = Record<string, unknown>;
type RequestInitWithTimeout = RequestInit & { timeoutMs?: number };
type QueryInput = string | URLSearchParams | Record<string, string | number | boolean | null | undefined> | null | undefined;
type ApiResponse = JsonRecord & { data?: unknown; message?: string };

const baseURL = "https://api.bindersoftware.com";

function asMessage(value: unknown, fallback: string) {
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
}

function toQueryString(query: QueryInput) {
  if (!query) return '';
  if (typeof query === 'string') {
    if (!query.trim()) return '';
    return query.startsWith('?') ? query : `?${query}`;
  }

  const params = query instanceof URLSearchParams ? query : new URLSearchParams();
  if (!(query instanceof URLSearchParams)) {
    for (const [key, value] of Object.entries(query)) {
      if (value == null || value === '') continue;
      params.set(key, String(value));
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

function appendQuery(url: string, query: QueryInput) {
  return `${url}${toQueryString(query)}`;
}

async function readResponse(res: Response) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      return { isJson, data: (await res.json()) as JsonRecord };
    } catch {
      const text = await res.text().catch(() => '');
      return {
        isJson: false,
        data: { message: text.trim().slice(0, 160) || `HTTP ${res.status}` },
      };
    }
  }

  const text = await res.text();
  const preview = (text ?? '').trim().slice(0, 160);
  const isHtml = /^\s*</.test(preview);

  return {
    isJson: false,
    data: {
      message: isHtml
        ? `Server returned HTML instead of JSON (HTTP ${res.status}) — you may need to log in again.`
        : (preview || `HTTP ${res.status}`),
    },
  };
}

export async function safeFetch(url: string, opts: RequestInitWithTimeout = {}): Promise<ApiResponse> {
  const { timeoutMs = 10000, ...requestInit } = opts;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  url = url.startsWith('http') ? url : `${baseURL}${url}`;

  const token = localStorage.getItem('gradicent_access_token');
  const authHeaders: Record<string, string> = {};
  
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    res = await fetch(url, {
      ...requestInit,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,        
        ...requestInit.headers,
      },
    });
  } catch (networkErr) {
    window.clearTimeout(timeoutId);
    const error = networkErr instanceof Error ? networkErr : new Error(String(networkErr));
    if (error.name === 'AbortError') {
      console.error('[API] Request timed out:', url);
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    console.error('[API] Network error:', url, error);
    throw new Error(`Network error — ${error.message}`);
  }

  window.clearTimeout(timeoutId);
  const parsed = await readResponse(res);

  if (!res.ok) {
    throw new Error(asMessage(parsed.data?.message, `HTTP ${res.status}`));
  }

  if (!parsed.isJson) {
    throw new Error(asMessage(parsed.data?.message, 'Server returned non-JSON response'));
  }

  return parsed.data as ApiResponse;
}

export async function fetchDomain() {
  try {
    const res = await safeFetch('/api/binder/get_domain');
    return (res.data as string) || 'business';
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn('[API] Could not load domain — using "business" as default:', error.message);
    return 'business';
  }
}

export async function fetchUserId(): Promise<string | number | null> {
  try {
    const res = await safeFetch('/api/auth/me');
    const id = (res.data as JsonRecord | undefined)?.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn('[API] Could not load user ID — proceeding as unauthenticated:', error.message);
    return null;
  }
}

export async function fetchPlanStatus(domain?: string | null, userId?: string | number | null): Promise<string> {
  try {
    const query = buildContextQuery(domain, userId);
    const res = await safeFetch(appendQuery('/api/binder/get_plan_status', query));
    const data = res.data as JsonRecord | string | undefined;
    if (typeof data === 'string') return data;
    return (data?.plan as string | undefined) ?? (data?.status as string | undefined) ?? 'basic';
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn('[API] Could not load plan status — using default access:', error.message);
    return 'basic';
  }
}

export async function fetchList<T = unknown>(listEndpoint: string, contextQuery: QueryInput) {
  return safeFetch(appendQuery(listEndpoint, contextQuery)) as Promise<T>;
}

export async function fetchOne<T = unknown>(listEndpoint: string, id: string | number, contextQuery: QueryInput) {
  return safeFetch(appendQuery(`${listEndpoint}/${encodeURIComponent(String(id))}`, contextQuery)) as Promise<T>;
}

export async function searchEntities<T = unknown>(searchEndpoint: string, payload: unknown) {
  return safeFetch(searchEndpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<T>;
}

export async function createEntity<T = unknown>(apiBase: string, payload: unknown) {
  return safeFetch(apiBase, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<T>;
}

export async function updateEntity<T = unknown>(candidates: string[], payload: unknown) {
  let lastErr: unknown = null;

  for (const url of candidates) {
    try {
      return (await safeFetch(url, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })) as T;
    } catch (err) {
      lastErr = err;
    }
  }

  const tried = candidates.join(', ');
  console.error(`[API] Update failed. Tried: ${tried}`, lastErr);
  const message = lastErr instanceof Error ? lastErr.message : String(lastErr ?? `Update failed (tried: ${tried})`);
  throw new Error(message || `Update failed (tried: ${tried})`);
}

export async function deleteEntity(candidates: string[], contextQuery: QueryInput) {
  let lastErr: unknown = null;

  for (const url of candidates) {
    try {
      await safeFetch(appendQuery(url, contextQuery), { method: 'DELETE' });
      return;
    } catch (err) {
      lastErr = err;
    }
  }

  const tried = candidates.join(', ');
  console.error(`[API] Delete failed. Tried: ${tried}`, lastErr);
  const message = lastErr instanceof Error ? lastErr.message : String(lastErr ?? `Delete failed (tried: ${tried})`);
  throw new Error(message || `Delete failed (tried: ${tried})`);
}

export async function getAppointmentsForDate(dateIso: string, domain: string | null | undefined, userId: string | number | null | undefined) {
  const query = buildContextQuery(domain, userId);
  const res = await safeFetch(appendQuery(`/api/binder/appointments/${encodeURIComponent(dateIso)}`, query));
  const data = res.data as JsonRecord | undefined;
  return Array.isArray(data?.appointments) ? data?.appointments : [];
}

export async function saveAppointments(dateIso: string, appointments: unknown[], domain: string | null | undefined, userId: string | number | null | undefined) {
  const query = buildContextQuery(domain, userId);
  return safeFetch(appendQuery(`/api/binder/appointments/${encodeURIComponent(dateIso)}`, query), {
    method: 'PATCH',
    body: JSON.stringify({ appointments }),
  });
}

export async function lockAppointment(no: string | number, domain: string | null | undefined, dateIso: string, userId: string | number | null | undefined) {
  return safeFetch('/api/binder/appointments/lock', {
    method: 'POST',
    body: JSON.stringify({
      no,
      user_id: userId,
      date: dateIso,
      domain,
    }),
  });
}

export async function trackUsageTime(seconds: number) {
  return safeFetch('/api/binder/track_time', {
    method: 'POST',
    body: JSON.stringify({ seconds }),
  });
}

export async function submitClientRegistration(payload: JsonRecord, domain?: string | null, userId?: string | number | null) {
  const query = buildContextQuery(domain, userId);
  return safeFetch(appendQuery('/api/binder/clients', query), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getContextQuery(domain: string | null | undefined, userId: string | number | null | undefined) {
  return buildContextQuery(domain, userId);
}

export const api = {
  safeFetch,
  fetchDomain,
  fetchUserId,
  fetchPlanStatus,
  fetchList,
  fetchOne,
  searchEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  getAppointmentsForDate,
  saveAppointments,
  lockAppointment,
  trackUsageTime,
  submitClientRegistration,
  getContextQuery,
};

export const getDomain = fetchDomain;
export const getUserId = fetchUserId;
