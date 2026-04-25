import { fetchDomain, fetchUserId } from './api.ts';
import { TYPE } from './config.ts';
import { buildContextQuery } from './context.ts';

export type ThemeMode = 'light' | 'dark';

export interface EntityManagerApi {
  search: () => Promise<void>;
  add: () => Promise<void>;
  view: (id: string | number) => void;
  edit: (id: string | number) => void;
  remove: (id: string | number) => Promise<void>;
  loadAll: () => Promise<void>;
  toggleAddForm: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  getTheme: () => ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => ThemeMode;
  cleanup: () => void;
  clearAllToasts: () => void;
  getDomain: () => string;
  getUserId: () => string | number | null;
  getContextQuery: () => string;
}

type ListenerRecord = {
  el: EventTarget;
  event: string;
  handler: EventListenerOrEventListenerObject;
  opts?: boolean | AddEventListenerOptions;
};

const THEME_STORAGE_KEY = 'gradicent-dark-mode';
const SIDEBAR_OPEN_CLASS = 'sidebar-open';
const TOPBAR_HIDDEN_CLASS = 'top-bar-hidden';
const THEME_STYLE_ID = 'entity-manager-theme-styles';

const listeners: ListenerRecord[] = [];
let currentTheme: ThemeMode = 'light';
let currentDomain = TYPE || 'entity';
let currentUserId: string | number | null = null;
let bootstrapped = false;

function on(el: EventTarget | null | undefined, event: string, handler: EventListenerOrEventListenerObject, opts?: boolean | AddEventListenerOptions) {
  if (!el) return;
  el.addEventListener(event, handler, opts);
  listeners.push({ el, event, handler, opts });
}

function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'true' || stored === 'dark') return 'dark';
    if (stored === 'false' || stored === 'light') return 'light';
  } catch {
    // Ignore storage failures.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeDom(theme: ThemeMode) {
  if (!document.documentElement) return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.body?.classList.toggle('theme-dark', theme === 'dark');
  document.body?.classList.toggle('theme-light', theme === 'light');
}

export function injectThemeStyles() {
  if (document.getElementById(THEME_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = THEME_STYLE_ID;
  style.textContent = `
    html[data-theme='dark'] {
      color-scheme: dark;
    }
    html[data-theme='light'] {
      color-scheme: light;
    }
    .${TOPBAR_HIDDEN_CLASS} {
      transform: translateY(-100%);
      transition: transform 180ms ease;
    }
  `;
  document.head.appendChild(style);
}

export function applyTheme(theme: ThemeMode) {
  currentTheme = theme;
  updateThemeDom(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, String(theme === 'dark'));
  } catch {
    // Ignore storage failures.
  }
}

export function getTheme() {
  if (bootstrapped) return currentTheme;
  const theme = readStoredTheme();
  currentTheme = theme;
  return theme;
}

export function setTheme(theme: ThemeMode) {
  applyTheme(theme);
  return theme;
}

export function toggleTheme() {
  return setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function ensureSidebarThemeToggle() {
  const existingButton = document.querySelector<HTMLButtonElement>('[data-entity-theme-toggle]');
  if (existingButton) return { button: existingButton };

  const host = document.querySelector<HTMLElement>('.sidebar-actions, .topbar-actions, .layout-actions');
  if (!host) return { button: null as HTMLButtonElement | null };

  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.entityThemeToggle = 'true';
  button.className = 'btn-ghost btn-sm';
  button.textContent = 'Theme';
  button.setAttribute('aria-label', 'Toggle theme');
  host.appendChild(button);
  return { button };
}

export function clearAllToasts() {
  document.querySelectorAll('.toast-container .toast, [data-toast]').forEach((toast) => toast.remove());
}

export function toggleSidebar() {
  document.body?.classList.toggle(SIDEBAR_OPEN_CLASS);
}

export function closeSidebar() {
  document.body?.classList.remove(SIDEBAR_OPEN_CLASS);
}

export function createScrollHandler(topBar: HTMLElement) {
  let lastY = window.scrollY;

  return () => {
    const nextY = window.scrollY;
    const scrollingDown = nextY > lastY + 4;
    const scrollingUp = nextY < lastY - 4;

    topBar.classList.toggle(TOPBAR_HIDDEN_CLASS, scrollingDown && nextY > 120);
    if (scrollingUp) {
      topBar.classList.remove(TOPBAR_HIDDEN_CLASS);
    }

    lastY = nextY;
  };
}

export function getDomain() {
  return currentDomain;
}

export function getUserId() {
  return currentUserId;
}

export function setDomain(domain: string) {
  currentDomain = domain || TYPE || 'entity';
}

export function setUserId(userId: string | number | null) {
  currentUserId = userId;
}

export function getContextQuery() {
  return buildContextQuery(currentDomain, currentUserId);
}

export async function search() {
  window.dispatchEvent(new CustomEvent('entity:search'));
}

export async function add() {
  window.dispatchEvent(new CustomEvent('entity:add'));
}

export function view(id: string | number) {
  window.dispatchEvent(new CustomEvent('entity:view', { detail: { id } }));
}

export function edit(id: string | number) {
  window.dispatchEvent(new CustomEvent('entity:edit', { detail: { id } }));
}

export async function remove(id: string | number) {
  window.dispatchEvent(new CustomEvent('entity:remove', { detail: { id } }));
}

export async function loadAll() {
  window.dispatchEvent(new CustomEvent('entity:loadAll'));
}

export function toggleAddForm() {
  const form = document.querySelector<HTMLElement>('#add-form, #interactionForm, #visitForm');
  if (!form) return;
  const hidden = form.dataset.hidden === 'true';
  form.dataset.hidden = hidden ? 'false' : 'true';
  form.style.display = hidden ? '' : 'none';
}

export function handleCustomAction(actionKey: string, id: string | number) {
  window.dispatchEvent(new CustomEvent('entity:customAction', { detail: { actionKey, id } }));
}

export function handleAddMenuAction(actionKey: string) {
  window.dispatchEvent(new CustomEvent('entity:addMenuAction', { detail: { actionKey } }));
}

export function cleanup() {
  for (const { el, event, handler, opts } of listeners) {
    el.removeEventListener(event, handler, opts);
  }
  listeners.length = 0;
  clearAllToasts();
  document.body?.classList.remove(SIDEBAR_OPEN_CLASS);
}

async function init() {
  if (bootstrapped) return;
  bootstrapped = true;

  injectThemeStyles();
  applyTheme(getTheme());

  const { button: themeToggleBtn } = ensureSidebarThemeToggle();
  if (themeToggleBtn) {
    on(themeToggleBtn, 'click', () => toggleTheme());
  }

  try {
    const [domain, userId] = await Promise.all([fetchDomain(), fetchUserId()]);
    setDomain(domain);
    setUserId((typeof userId === 'string' || typeof userId === 'number') ? userId : null);
  } catch (error) {
    console.warn('[EntityManager] init: failed to load user context:', error);
  }

  const topBar = document.querySelector<HTMLElement>('.top-bar');
  if (topBar) {
    on(window, 'scroll', createScrollHandler(topBar), { passive: true });
  }

  const queryInput = document.getElementById('query_input');
  if (queryInput) {
    on(queryInput, 'keydown', (event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        keyboardEvent.preventDefault();
        void search();
      }
    });
  }

  const searchBtn = document.getElementById('search_btn');
  if (searchBtn) {
    on(searchBtn, 'click', () => { void search(); });
  }

  const addToggle = document.getElementById('add_toggle');
  if (addToggle) {
    on(addToggle, 'click', () => { toggleAddForm(); });
  }

  const addBtn = document.getElementById('add_btn');
  if (addBtn) {
    on(addBtn, 'click', () => { void add(); });
  }

  const addMenuActions = document.getElementById('add-menu-actions');
  if (addMenuActions) {
    on(addMenuActions, 'click', (event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest?.('[data-add-menu-action]') as HTMLElement | null;
      if (button?.dataset.addMenuAction) {
        handleAddMenuAction(button.dataset.addMenuAction);
      }
    });
  }

  const menuToggle = document.getElementById('menu-toggle');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (menuToggle) on(menuToggle, 'click', () => { toggleSidebar(); });
  if (sidebarOverlay) on(sidebarOverlay, 'click', () => { closeSidebar(); });

  const resultsContainer = document.getElementById('results');
  if (resultsContainer) {
    on(resultsContainer, 'click', (event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest?.('[data-action]') as HTMLElement | null;
      if (!button) return;
      const action = button.dataset.action ?? '';
      const id = button.dataset.id ?? '';
      if (action === 'view') view(id);
      else if (action === 'edit') edit(id);
      else if (action === 'delete') void remove(id);
      else handleCustomAction(action, id);
    });
  }

  await loadAll();
}

export function bootstrapEntityManager() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { void init(); }, { once: true });
  } else {
    queueMicrotask(() => { void init(); });
  }
}

const EntityManager: EntityManagerApi = {
  search,
  add,
  view,
  edit,
  remove,
  loadAll,
  toggleAddForm,
  toggleSidebar,
  closeSidebar,
  getTheme,
  setTheme,
  toggleTheme,
  cleanup,
  clearAllToasts,
  getDomain,
  getUserId,
  getContextQuery,
};

if (typeof window !== 'undefined') {
  (window as Window & { EntityManager?: EntityManagerApi }).EntityManager = EntityManager;
}

export default EntityManager;
