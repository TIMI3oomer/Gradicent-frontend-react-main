import { TYPE } from './config.ts';
import { buildContextQuery as buildSharedContextQuery } from './context.ts';

export type InteractionDomain = 'medical' | 'business';
export type EntryMode = 'interactions' | 'transactions';

export type NormalizedEntry = {
  date: string;
  owner: string;
  title: string;
  service: string;
  notes: string;
  cost: number;
  paid: number;
  debt: number;
  detail1: string;
  detail2: string;
  detail3: string;
  printed: boolean;
  vno: number;
};

type DomainConfig = {
  label: string;
  formId: string;
  dom: Record<string, string | undefined>;
  fields: Record<string, string>;
  lockOnPrint: boolean;
};

export const DOMAIN_CONFIG: Record<InteractionDomain, DomainConfig> = {
  medical: {
    label: 'Visit',
    formId: '#visitForm',
    dom: {
      date: '#visitDate',
      owner: '#drname',
      title: '#diagnosis',
      service: '#treatment',
      notes: '#details',
      cost: '#coast',
      paid: '#payed',
      debt: '#debt',
      detail1: '#weight',
      detail2: '#height',
      detail3: '#lab',
    },
    fields: {
      date: 'visit_date',
      owner: 'drname',
      title: 'diagnosis',
      service: 'treatment',
      notes: 'details',
      cost: 'coast',
      paid: 'payed',
      debt: 'debit',
      detail1: 'weight',
      detail2: 'height',
      detail3: 'lab',
    },
    lockOnPrint: true,
  },
  business: {
    label: 'Transaction',
    formId: '#interactionForm',
    dom: {
      date: '#interactionDate',
      owner: '#employeeName',
      title: '#purpose',
      service: '#service',
      notes: '#notes',
      cost: '#cost',
      paid: '#paid',
      debt: '#debt',
      detail1: '#outcome',
      detail2: '#nextFollowUp',
    },
    fields: {
      date: 'date',
      owner: 'handled_by',
      title: 'service_name',
      service: 'service',
      notes: 'notes',
      cost: 'amount',
      paid: 'paid',
      debt: 'balance',
      detail1: 'description',
      detail2: 'next',
    },
    lockOnPrint: true,
  },
};

export function getInteractionDomain(type: string | null | undefined = TYPE): InteractionDomain {
  return type === 'business' ? 'business' : 'medical';
}

export function getDomainConfig(domain: string | null | undefined = TYPE) {
  return DOMAIN_CONFIG[getInteractionDomain(domain)];
}

export function getEntryCollectionKey(transactionMode: boolean) {
  return transactionMode ? 'transactions' : 'interactions';
}

export function getEntryPayloadKey(transactionMode: boolean) {
  return transactionMode ? 'transaction' : 'interaction';
}

export function getEntryNumberKey(transactionMode: boolean) {
  return transactionMode ? 'transaction_no' : 'interaction_no';
}

export function getInitialTransactionMode(
  pageSection: string | null,
  transactionModeFlag: boolean,
  storedSection: string | null,
) {
  if (pageSection === 'transactions') return true;
  if (pageSection === 'interactions') return false;
  if (transactionModeFlag) return true;
  if (storedSection === 'transactions') return true;
  if (storedSection === 'interactions') return false;
  return false;
}

export function normalizeEntry(
  raw: Record<string, unknown> = {},
  domain: string | null | undefined = TYPE,
  vno = 1,
): NormalizedEntry {
  const cfg = getDomainConfig(domain);
  const fields = cfg.fields;

  return {
    date: String(raw[fields.date] ?? ''),
    owner: String(raw[fields.owner] ?? ''),
    title: String(raw[fields.title] ?? ''),
    service: String(raw[fields.service] ?? ''),
    notes: String(raw[fields.notes] ?? ''),
    cost: Number(raw[fields.cost] ?? 0),
    paid: Number(raw[fields.paid] ?? 0),
    debt: Number(raw[fields.debt] ?? 0),
    detail1: String(raw[fields.detail1] ?? ''),
    detail2: String(raw[fields.detail2] ?? ''),
    detail3: fields.detail3 ? String(raw[fields.detail3] ?? '') : '',
    printed: Boolean(raw.printed),
    vno: Number(raw.vno ?? vno),
  };
}

export function buildEntryPayload(
  values: {
    date?: string;
    owner?: string;
    title?: string;
    service?: string;
    notes?: string;
    cost?: number | string;
    paid?: number | string;
    detail1?: string;
    detail2?: string;
    detail3?: string;
    vno?: number;
  },
  domain: string | null | undefined = TYPE,
) {
  const cfg = getDomainConfig(domain);
  const fields = cfg.fields;
  const cost = Number(values.cost ?? 0);
  const paid = Number(values.paid ?? 0);
  const payload: Record<string, unknown> = {
    [fields.date]: values.date ?? '',
    [fields.owner]: values.owner ?? '',
    [fields.title]: values.title ?? '',
    [fields.service]: values.service ?? '',
    [fields.notes]: values.notes ?? '',
    [fields.cost]: cost,
    [fields.paid]: paid,
    [fields.debt]: cost - paid,
    [fields.detail1]: values.detail1 ?? '',
    [fields.detail2]: values.detail2 ?? '',
    vno: values.vno ?? 1,
  };

  if (fields.detail3) {
    payload[fields.detail3] = values.detail3 ?? '';
  }

  return payload;
}

export function getDefaultFolderForDomain(domain: string | null | undefined = TYPE) {
  return getInteractionDomain(domain) === 'medical' ? 'drs' : 'contracts';
}

export function getDefaultPageSection(transactionMode: boolean) {
  return transactionMode ? 'transactions' : 'interactions';
}

export function isSafeInternalPath(path: unknown) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
}

export function resolveLastPagePath(currentPath: string, storedPath: unknown, referrer: string | null | undefined) {
  if (isSafeInternalPath(storedPath) && storedPath !== currentPath) return storedPath;

  try {
    if (referrer) {
      const ref = new URL(referrer);
      if (ref.origin === window.location.origin) {
        const refPath = `${ref.pathname}${ref.search}`;
        if (isSafeInternalPath(refPath) && refPath !== currentPath) return refPath;
      }
    }
  } catch {
    // Ignore malformed referrers.
  }

  return null;
}

export function buildContextQuery(domain: string | null | undefined, userId: string | number | null | undefined) {
  return buildSharedContextQuery(domain, userId);
}
