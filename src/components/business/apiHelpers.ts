// Small helpers shared by the business pages for unpacking binder API responses.

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

export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return fallback;
}

/** True when the backend answered 404/405, i.e. the route has not been implemented yet. */
export function isMissingEndpoint(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? '');
  return /\bHTTP (404|405)\b/.test(message) || /\b(404|405)\b.*(Not Found|Method Not Allowed)/i.test(message);
}

/** Coerces API numbers that may arrive as strings / null into a finite number (0 otherwise). */
export function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
