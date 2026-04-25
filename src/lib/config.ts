type EntityAction = {
  key: string;
  label?: string;
  variant?: string;
  url?: string;
  message?: string;
};

type EntityConfig = {
  apiBase: string;
  listEndpoint?: string | null;
  searchEndpoint?: string | null;
  updateEndpointBase?: string | null;
  detailUrl?: string | null;
  labels: {
    singular: string;
    plural: string;
  };
  fields: {
    display: string[];
    search: string[];
    add: string[];
  };
  numericIdBase?: number;
  enableDelete?: boolean;
  actions?: EntityAction[];
};

declare global {
  interface Window {
    __ENTITY_CONFIG__?: Partial<EntityConfig>;
    __ENTITY_TYPE__?: string;
  }
}

const RAW = window.__ENTITY_CONFIG__ ?? {};

export const TYPE = (window.__ENTITY_TYPE__ || 'entity').trim().toLowerCase();

function cloneStrings(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? [...value].filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [...fallback];
}

export const CONFIG = Object.freeze({
  apiBase: RAW.apiBase ?? '',
  listEndpoint: RAW.listEndpoint ?? null,
  searchEndpoint: RAW.searchEndpoint ?? null,
  updateEndpointBase: RAW.updateEndpointBase ?? null,
  detailUrl: RAW.detailUrl ?? null,
  numericIdBase: typeof RAW.numericIdBase === 'number' ? RAW.numericIdBase : 0,
  enableDelete: Boolean(RAW.enableDelete),
  labels: Object.freeze({
    singular: RAW.labels?.singular ?? 'item',
    plural: RAW.labels?.plural ?? 'items',
  }),
  fields: Object.freeze({
    display: cloneStrings(RAW.fields?.display, ['name']),
    search: cloneStrings(RAW.fields?.search, ['name']),
    add: cloneStrings(RAW.fields?.add, ['name']),
  }),
  actions: Array.isArray(RAW.actions)
    ? RAW.actions
        .filter((action): action is EntityAction => Boolean(action && typeof action.key === 'string' && action.key.trim()))
        .map((action) => Object.freeze({
          ...action,
          key: action.key.trim(),
        }))
    : [],
} as const);

if (!CONFIG.apiBase) {
  console.warn('[EntityManager] CONFIG.apiBase is empty — create (POST) will fail.');
}

export type { EntityAction, EntityConfig };
