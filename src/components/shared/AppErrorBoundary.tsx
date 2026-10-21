import { Component, type ErrorInfo, type ReactNode } from 'react';

const RELOAD_FLAG = 'binder:chunk-reload';

/**
 * After a deploy, a tab opened earlier asks for code chunks that no longer exist. Reload once to
 * pick up the new version instead of showing an error; give up if that already happened.
 */
export function isStaleChunkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|ChunkLoadError/i.test(message);
}

function reloadOnceForNewVersion(): boolean {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false;
    sessionStorage.setItem(RELOAD_FLAG, '1');
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/** Lazy page import that recovers from stale chunks (see above). */
export function loadPage<T>(load: () => Promise<T>): Promise<T> {
  return load().then(
    mod => {
      try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* storage unavailable */ }
      return mod;
    },
    err => {
      if (isStaleChunkError(err) && reloadOnceForNewVersion()) return new Promise<T>(() => {});
      throw err;
    },
  );
}

interface State {
  error: Error | null;
}

/** Last-resort screen so one broken page never leaves the whole app blank. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[App] Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const stale = isStaleChunkError(this.state.error);
    return (
      <div role="alert" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg, #F5F7FA)' }}>
        <div style={{ maxWidth: 440, textAlign: 'center', fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1A2332)', marginBottom: 8 }}>
            {stale ? 'A new version is available' : 'Something went wrong'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted, #5A6880)', lineHeight: 1.6, marginBottom: 20 }}>
            {stale
              ? 'Binder Software was updated while this tab was open. Reload to continue.'
              : 'This page hit an unexpected problem. Your saved data is safe — reload to try again.'}
          </p>
          <button type="button" className="btn-primary btn-md" onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }
}
