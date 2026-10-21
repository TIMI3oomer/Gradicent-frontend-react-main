// Upload, list, open and remove the documents attached to one patient or client.
import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import {
  Download, Eye, File as FileIcon, FileAudio, FileImage, FileSpreadsheet, FileText, FileVideo,
  Lock, RotateCcw, Trash2, UploadCloud, X,
} from 'lucide-react';
import { Modal } from '../Modal/Modal';
import { ErrorBanner, LoadingState } from '../PageStatus';
import { errorMessage } from '../apiHelpers';
import { formatDate, formatFileSize, formatRelativeTime } from '../../../lib/formatters';
import {
  ALLOWED_EXTENSIONS, CATEGORIES, MAX_FILE_BYTES, categoryLabel, deleteDocument, documentUrl, listDocuments,
  uploadDocument, validateFile, type DocumentDomain, type StoredDocument,
} from './documentsApi';

interface DocumentsPanelProps {
  domain: DocumentDomain;
  clientId: string;
  /** e.g. "patient" or "client", used in empty states and hints */
  subject: string;
}

type Job = {
  key: string;
  file: File;
  category: string;
  progress: number;
  status: 'queued' | 'uploading' | 'error';
  error?: string;
};

const isCancel = (err: unknown) =>
  (err instanceof DOMException && err.name === 'AbortError') || (err instanceof Error && err.message === 'Request cancelled');

function DocIcon({ type }: { type: string }) {
  const props = { size: 18, 'aria-hidden': true } as const;
  if (type.startsWith('image/')) return <FileImage {...props} />;
  if (type.startsWith('video/')) return <FileVideo {...props} />;
  if (type.startsWith('audio/')) return <FileAudio {...props} />;
  if (/sheet|excel|csv/.test(type)) return <FileSpreadsheet {...props} />;
  if (/pdf|word|document|text|rtf/.test(type)) return <FileText {...props} />;
  return <FileIcon {...props} />;
}

let jobCounter = 0;

export function DocumentsPanel({ domain, clientId, subject }: DocumentsPanelProps) {
  const categories = CATEGORIES[domain];
  const [docs, setDocs] = useState<StoredDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState('all');
  const [uploadCategory, setUploadCategory] = useState(categories[0].value);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<StoredDocument | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const controllers = useRef(new Map<string, AbortController>());

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setLoadError(null);
    listDocuments(domain, clientId)
      .then(rows => { if (!ignore) setDocs(rows); })
      .catch(err => { if (!ignore) setLoadError(errorMessage(err, 'Could not load documents.')); })
      .finally(() => { if (!ignore) setIsLoading(false); });
    return () => { ignore = true; };
  }, [domain, clientId, reloadKey]);

  // Leaving the page cancels uploads in flight
  useEffect(() => {
    const active = controllers.current;
    return () => active.forEach(controller => controller.abort());
  }, []);

  const pending = jobs.some(job => job.status !== 'error');
  useEffect(() => {
    if (!pending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pending]);

  const patchJob = useCallback((key: string, changes: Partial<Job>) => {
    setJobs(prev => prev.map(job => (job.key === key ? { ...job, ...changes } : job)));
  }, []);

  // One upload at a time, in the order the files were added
  useEffect(() => {
    if (jobs.some(job => job.status === 'uploading')) return;
    const next = jobs.find(job => job.status === 'queued');
    if (!next) return;
    const controller = new AbortController();
    controllers.current.set(next.key, controller);
    patchJob(next.key, { status: 'uploading', progress: 0, error: undefined });
    uploadDocument(domain, clientId, next.file, next.category, progress => patchJob(next.key, { progress }), controller.signal)
      .then(doc => {
        setDocs(prev => [doc, ...prev]);
        setJobs(prev => prev.filter(job => job.key !== next.key));
        setNotice(`${doc.name} saved to the ${subject}'s record.`);
      })
      .catch(err => {
        if (isCancel(err)) setJobs(prev => prev.filter(job => job.key !== next.key));
        else patchJob(next.key, { status: 'error', error: errorMessage(err, 'Upload failed.') });
      })
      .finally(() => controllers.current.delete(next.key));
  }, [jobs, domain, clientId, subject, patchJob]);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setNotice(null);
    const added: Job[] = Array.from(files).map(file => {
      const problem = validateFile(file);
      jobCounter += 1;
      return {
        key: `job-${jobCounter}`,
        file,
        category: uploadCategory,
        progress: 0,
        status: problem ? 'error' : 'queued',
        error: problem ?? undefined,
      };
    });
    setJobs(prev => [...prev, ...added]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const cancelJob = (job: Job) => {
    const controller = controllers.current.get(job.key);
    if (controller) controller.abort();
    else setJobs(prev => prev.filter(j => j.key !== job.key));
  };

  const openDocument = async (doc: StoredDocument, download: boolean) => {
    setActionError(null);
    setBusyId(doc.id);
    // Open the tab now, while the click still counts as a user action, so pop-up blockers allow it
    const tab = download ? null : window.open('about:blank', '_blank');
    try {
      const url = await documentUrl(domain, doc.id, download);
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.rel = 'noopener noreferrer';
        if (!download) link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      tab?.close();
      setActionError(errorMessage(err, 'Could not open this file.'));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteDocument(domain, toDelete.id);
      setDocs(prev => prev.filter(doc => doc.id !== toDelete.id));
      setNotice(`${toDelete.name} was removed.`);
      setToDelete(null);
    } catch (err) {
      setActionError(errorMessage(err, 'Could not remove this file.'));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const counts = docs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.category] = (acc[doc.category] ?? 0) + 1;
    return acc;
  }, {});
  const visible = filter === 'all' ? docs : docs.filter(doc => doc.category === filter);
  const filters = [{ value: 'all', label: 'All', count: docs.length }, ...categories
    .filter(c => counts[c.value])
    .map(c => ({ value: c.value, label: c.label, count: counts[c.value] }))];

  return (
    <div className="docs">
      <div className="docs-toolbar">
        <div>
          <div className="card-title">Documents</div>
          <div className="docs-private-note"><Lock size={12} aria-hidden="true" /> Private — links to a file expire after 5 minutes</div>
        </div>
        <label className="docs-category-picker">
          <span>Save new files as</span>
          <select className="form-input form-select" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
      </div>

      <div
        className={`docs-dropzone${dragActive ? ' is-active' : ''}`}
        onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragActive(false); }}
        onDrop={onDrop}
      >
        <UploadCloud size={28} aria-hidden="true" />
        <div className="docs-dropzone-title">Drag files here or</div>
        <button type="button" className="btn-primary btn-sm" onClick={() => inputRef.current?.click()}>Choose files</button>
        <div className="docs-dropzone-hint">
          PDF, images, scans (DICOM), Office documents, audio or video · up to {MAX_FILE_BYTES / (1024 * 1024)} MB each
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {jobs.length > 0 && (
        <ul className="docs-jobs" aria-label="Uploads">
          {jobs.map(job => (
            <li key={job.key} className={`docs-job${job.status === 'error' ? ' is-error' : ''}`}>
              <div className="docs-job-main">
                <div className="docs-job-name" title={job.file.name}>{job.file.name}</div>
                <div className="docs-job-meta">
                  {job.status === 'error' ? job.error
                    : job.status === 'queued' ? `Waiting · ${formatFileSize(job.file.size)}`
                    : job.progress >= 1 ? 'Saving…'
                    : `Uploading ${Math.round(job.progress * 100)}% · ${formatFileSize(job.file.size)}`}
                </div>
                {job.status === 'uploading' && (
                  <div
                    className="docs-progress"
                    role="progressbar"
                    aria-label={`Uploading ${job.file.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(job.progress * 100)}
                  >
                    <div style={{ width: `${Math.max(3, job.progress * 100)}%` }} />
                  </div>
                )}
              </div>
              {job.status === 'error' && !validateFile(job.file) && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => patchJob(job.key, { status: 'queued', error: undefined })}>
                  <RotateCcw size={13} aria-hidden="true" /> Retry
                </button>
              )}
              <button
                type="button"
                className="btn-ghost btn-sm docs-icon-btn"
                onClick={() => cancelJob(job)}
                aria-label={job.status === 'error' ? `Dismiss ${job.file.name}` : `Cancel upload of ${job.file.name}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div role="status" aria-live="polite" className="docs-notice">
        {notice && <span>{notice}</span>}
      </div>
      {actionError && <ErrorBanner message={actionError} />}

      {isLoading ? <LoadingState label="Loading documents..." padding="32px 0" />
        : loadError ? <ErrorBanner message={loadError} onRetry={() => setReloadKey(k => k + 1)} />
        : docs.length === 0 ? (
          <div className="docs-empty">No documents yet. Files you upload are stored privately on this {subject}'s record.</div>
        ) : (
          <>
            {filters.length > 2 && (
              <div className="docs-filters" role="group" aria-label="Filter documents">
                {filters.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    className={`docs-filter${filter === f.value ? ' is-active' : ''}`}
                    aria-pressed={filter === f.value}
                    onClick={() => setFilter(f.value)}
                  >
                    {f.label} <span>{f.count}</span>
                  </button>
                ))}
              </div>
            )}
            <ul className="docs-list">
              {visible.map(doc => (
                <li key={doc.id} className="docs-item">
                  <div className="docs-item-icon"><DocIcon type={doc.contentType} /></div>
                  <div className="docs-item-main">
                    <button type="button" className="docs-item-name" onClick={() => openDocument(doc, false)} disabled={busyId === doc.id} title={doc.name}>
                      {doc.name}
                    </button>
                    <div className="docs-item-meta">
                      <span className="docs-tag">{categoryLabel(domain, doc.category)}</span>
                      <span>{formatFileSize(doc.size)}</span>
                      <time dateTime={doc.createdAt} title={formatDate(doc.createdAt, 'long')}>{formatRelativeTime(doc.createdAt)}</time>
                    </div>
                  </div>
                  <div className="docs-item-actions">
                    <button type="button" className="btn-ghost btn-sm docs-icon-btn" onClick={() => openDocument(doc, false)} disabled={busyId === doc.id} aria-label={`View ${doc.name}`} title="View">
                      <Eye size={15} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn-ghost btn-sm docs-icon-btn" onClick={() => openDocument(doc, true)} disabled={busyId === doc.id} aria-label={`Download ${doc.name}`} title="Download">
                      <Download size={15} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn-ghost btn-sm docs-icon-btn docs-danger" onClick={() => setToDelete(doc)} aria-label={`Remove ${doc.name}`} title="Remove">
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

      <Modal
        isOpen={!!toDelete}
        onClose={() => { if (!deleting) setToDelete(null); }}
        title="Remove document?"
        size="sm"
        footer={(
          <>
            <button type="button" className="btn-secondary btn-md" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</button>
            <button type="button" className="btn-danger btn-md" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Removing…' : 'Remove'}
            </button>
          </>
        )}
      >
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, overflowWrap: 'anywhere' }}>
          <strong>{toDelete?.name}</strong> will be removed from this {subject}'s documents and can no longer be opened.
        </p>
      </Modal>
    </div>
  );
}
