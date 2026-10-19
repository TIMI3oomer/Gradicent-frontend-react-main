// Small helpers shared by the business and medical pages for unpacking binder API responses.

export const SIGNED_OUT_MESSAGE = 'We could not confirm your session. Please sign in again.';

/**
 * Binder endpoints wrap lists in different shapes: `{ data: [...] }`, `{ data: { clients: [...] } }`,
 * `{ data: { results: [...] } }` or sometimes a bare array. Always return an array so the result can
 * safely reach DataTable / .map().
 */
export function toArray<T = Record<string, unknown>>(res: unknown, ...keys: string[]): T[] {
  if (Array.isArray(res)) return res as T[];
  if (!res || typeof res !== 'object') return [];
  const data = (res as { data?: unknown }).data;
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    for (const key of [...keys, 'results', 'items']) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  for (const key of [...keys, 'results', 'items']) {
    const value = (res as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

/** Unwraps `{ data: {...} }` into the record itself; returns null for anything that isn't an object. */
export function toRecord<T = Record<string, unknown>>(res: unknown): T | null {
  if (!res || typeof res !== 'object' || Array.isArray(res)) return null;
  const data = (res as { data?: unknown }).data;
  if (data && typeof data === 'object' && !Array.isArray(data)) return data as T;
  if ('data' in (res as object)) return null;
  return res as T;
}

/**
 * Turns raw fetch/back-end failures (stack-ish server text, "Failed to fetch", HTTP codes) into
 * something a user can act on. Plain validation messages from the API pass through unchanged.
 */
export function friendlyError(message: string): string {
  const text = message.trim();
  if (/network error|failed to fetch|networkerror|load failed/i.test(text)) {
    return "We couldn't reach the server. Check your internet connection and try again.";
  }
  if (/timed out|timeout/i.test(text)) return 'The server took too long to respond. Please try again.';
  if (/\bHTTP 401\b|unauthenticated|unauthori[sz]ed/i.test(text)) return SIGNED_OUT_MESSAGE;
  if (/\bHTTP 403\b|forbidden/i.test(text)) return "You don't have permission to do that.";
  if (/\bHTTP (404|405)\b/.test(text)) return "This feature isn't available yet.";
  if (/errno|traceback|error performing|server error|function_invocation|\bHTTP 5\d\d\b|server returned (html|non-json)/i.test(text)) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }
  // e.g. "400 Bad Request: Missing 'query'" → "Missing 'query'"
  return text.replace(/^\d{3}\s+[A-Za-z ]+:\s*/, '');
}

export function errorMessage(err: unknown, fallback: string): string {
  const status = (err as { status?: unknown } | null)?.status;
  if (typeof status === 'number' && status >= 500) return friendlyError('HTTP 500');
  if (status === 401) return SIGNED_OUT_MESSAGE;
  if (err instanceof Error && err.message.trim()) return friendlyError(err.message);
  if (typeof err === 'string' && err.trim()) return friendlyError(err);
  return fallback;
}

/** True when the backend answered 404/405, i.e. the route has not been implemented yet. */
export function isMissingEndpoint(err: unknown): boolean {
  const status = (err as { status?: unknown } | null)?.status;
  if (status === 404 || status === 405) return true;
  const message = err instanceof Error ? err.message : String(err ?? '');
  return /\bHTTP (404|405)\b/.test(message) || /\b(404|405)\b.*(Not Found|Method Not Allowed)/i.test(message);
}

/** Coerces API numbers that may arrive as strings / null into a finite number (0 otherwise). */
export function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
