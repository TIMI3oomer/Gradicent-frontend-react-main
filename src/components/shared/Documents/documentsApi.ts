// Patient / client documents. Files go straight from the browser to private storage through a
// one-time signed upload URL; the API only hands out that URL, records the file, and issues
// short-lived links to open it. Nothing is ever publicly reachable.
import { api } from '../../../lib/api';
import { toArray, toRecord } from '../apiHelpers';

export type DocumentDomain = 'medical' | 'business';

export type StoredDocument = {
  id: string;
  name: string;
  contentType: string;
  size: number | null;
  category: string;
  createdAt: string;
};

const FILES_ENDPOINT = '/api/binder/files';

/** Mirrors the API's limit (MAX_UPLOAD_BYTES) and the storage bucket's file size limit. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

/** Extensions the API and bucket accept. SVG/HTML are left out on purpose (they can carry scripts). */
export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.tif', '.tiff', '.bmp',
  '.dcm',
  '.txt', '.csv', '.rtf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods',
  '.mp3', '.m4a', '.wav', '.ogg', '.aac',
  '.mp4', '.mov', '.webm', '.avi', '.mpeg', '.mpg',
];

export const CATEGORIES: Record<DocumentDomain, { value: string; label: string }[]> = {
  medical: [
    { value: 'lab_results', label: 'Lab results' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'prescriptions', label: 'Prescriptions' },
    { value: 'referrals', label: 'Referrals' },
    { value: 'consent_forms', label: 'Consent forms' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' },
  ],
  business: [
    { value: 'contracts', label: 'Contracts' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'receipts', label: 'Receipts' },
    { value: 'identification', label: 'ID documents' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'other', label: 'Other' },
  ],
};

export function categoryLabel(domain: DocumentDomain, value: string) {
  return CATEGORIES[domain].find(c => c.value === value)?.label ?? 'Other';
}

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
};

/** Same checks the API makes, so the user hears about a bad file before it starts uploading. */
export function validateFile(file: File): string | null {
  if (!ALLOWED_EXTENSIONS.includes(extensionOf(file.name))) {
    return "This file type isn't supported. Upload a PDF, image, Office document, audio or video file.";
  }
  if (file.size === 0) return 'The file is empty.';
  if (file.size > MAX_FILE_BYTES) return `Files can be at most ${MAX_FILE_BYTES / (1024 * 1024)} MB.`;
  return null;
}

function text(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function toDocument(raw: unknown): StoredDocument | null {
  const record = toRecord<Record<string, unknown>>(raw);
  if (!record?.id) return null;
  const size = Number(record.size);
  return {
    id: text(record.id),
    name: text(record.name) || 'Untitled file',
    contentType: text(record.content_type),
    size: Number.isFinite(size) && record.size !== null ? size : null,
    category: text(record.category) || 'other',
    createdAt: text(record.created_at),
  };
}

export async function listDocuments(domain: DocumentDomain, clientId: string): Promise<StoredDocument[]> {
  const res = await api.fetchList<unknown>(FILES_ENDPOINT, { domain, client_id: clientId });
  return toArray<unknown>(res, 'files')
    .map(toDocument)
    .filter((doc): doc is StoredDocument => doc !== null);
}

/** Sends the file to storage with progress; `signal` cancels it. */
function putToStorage(url: string, file: File, contentType: string, onProgress: (fraction: number) => void, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    signal.addEventListener('abort', abort, { once: true });
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      signal.removeEventListener('abort', abort);
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = '';
      try { message = text(JSON.parse(xhr.responseText)?.message); } catch { /* not JSON */ }
      reject(new Error(
        xhr.status === 413 ? 'The file is larger than storage allows.'
          : xhr.status === 415 ? "This file type isn't supported."
          : message || `Upload failed (HTTP ${xhr.status}).`,
      ));
    };
    xhr.onerror = () => {
      signal.removeEventListener('abort', abort);
      reject(new Error('Network error while uploading. Check your connection and try again.'));
    };
    xhr.onabort = () => {
      signal.removeEventListener('abort', abort);
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };
    xhr.send(file);
  });
}

/** Full upload: get a signed URL, send the bytes, then record the file against the client. */
export async function uploadDocument(
  domain: DocumentDomain,
  clientId: string,
  file: File,
  category: string,
  onProgress: (fraction: number) => void,
  signal: AbortSignal,
): Promise<StoredDocument> {
  const ticket = toRecord<Record<string, unknown>>(await api.safeFetch(`${FILES_ENDPOINT}/uploads`, {
    method: 'POST',
    body: JSON.stringify({ domain, client_id: clientId, name: file.name, content_type: file.type, size: file.size }),
    signal,
  }));
  const uploadUrl = text(ticket?.upload_url);
  const path = text(ticket?.path);
  if (!uploadUrl || !path) throw new Error('Could not start the upload. Please try again.');

  await putToStorage(uploadUrl, file, text(ticket?.content_type) || file.type || 'application/octet-stream', onProgress, signal);

  const saved = toDocument(await api.safeFetch(FILES_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ domain, client_id: clientId, path, name: file.name, category }),
    signal,
  }));
  if (!saved) throw new Error('The file uploaded but could not be saved. Please try again.');
  return saved;
}

/** A link to the file that stops working after a few minutes. */
export async function documentUrl(domain: DocumentDomain, id: string, download = false): Promise<string> {
  const res = await api.safeFetch(
    `${FILES_ENDPOINT}/${encodeURIComponent(id)}/url?domain=${domain}${download ? '&download=1' : ''}`,
  );
  const url = text(toRecord<Record<string, unknown>>(res)?.url);
  if (!url) throw new Error('Could not open this file.');
  return url;
}

export async function deleteDocument(domain: DocumentDomain, id: string) {
  await api.safeFetch(`${FILES_ENDPOINT}/${encodeURIComponent(id)}?domain=${domain}`, { method: 'DELETE' });
}
