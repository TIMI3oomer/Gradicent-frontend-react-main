// Maps binder "client" records (patients are stored as clients in the medical domain) onto the Patient UI shape.
import { api } from '../../lib/api';
import { calculateAge, parseDate } from '../../lib/formatters';
import { isMissingEndpoint, toArray, toRecord } from '../shared/apiHelpers';
import type { Patient } from '../../types';

export const MEDICAL_DOMAIN = 'medical';
const CLIENTS_ENDPOINT = '/api/binder/clients';
// The plural /clients/search route answers 405, so search goes through the singular route
const CLIENT_SEARCH_ENDPOINT = '/api/binder/client/search';

type Raw = Record<string, unknown>;

const isObject = (value: unknown): value is Raw => !!value && typeof value === 'object' && !Array.isArray(value);
const isBlank = (value: unknown) => value === undefined || value === null || (typeof value === 'string' && !value.trim());

/**
 * AddPatient posts `{ client: {...}, legacy_fields: {...} }`, so the backend may hand the fields back
 * nested under those keys or flattened onto the record. Look at the top level first, then the nested copies.
 */
function sourcesOf(raw: Raw): Raw[] {
  const nested = ['client', 'legacy_fields', 'fields', 'patient', 'data']
    .map(key => raw[key])
    .filter(isObject);
  return [raw, ...nested];
}

function pick(sources: Raw[], ...keys: string[]): unknown {
  for (const source of sources) {
    for (const key of keys) {
      if (!isBlank(source[key])) return source[key];
    }
  }
  return undefined;
}

function text(value: unknown): string {
  if (isBlank(value)) return '';
  return typeof value === 'object' ? '' : String(value).trim();
}

function numberOrNull(value: unknown): number | null {
  if (isBlank(value)) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Accepts arrays or free text ("Penicillin, Sulfa" / one item per line). */
function list(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(item => (isObject(item) ? text(item.name ?? item.label ?? item.value) : text(item)))
      .filter(Boolean);
  }
  if (typeof value === 'string') return value.split(/[\n,;]+/).map(item => item.trim()).filter(Boolean);
  return [];
}

function normalizeGender(value: unknown): Patient['gender'] {
  const g = text(value).toLowerCase();
  if (!g) return '';
  if (g === 'f' || g === 'female' || g === 'woman') return 'F';
  if (g === 'm' || g === 'male' || g === 'man') return 'M';
  return 'Other';
}

function normalizeStatus(value: unknown): Patient['status'] {
  const s = text(value).toLowerCase();
  if (['discharged', 'inactive', 'archived', 'closed'].includes(s)) return 'Discharged';
  if (['pending', 'new', 'waiting', 'waitlist'].includes(s)) return 'Pending';
  // Registered patients without an explicit status are treated as active
  return 'Active';
}

function isFuture(value: string) {
  const date = parseDate(value);
  return !!date && date.getTime() >= Date.now();
}

export function normalizePatient(input: unknown): Patient | null {
  if (!isObject(input)) return null;
  const src = sourcesOf(input);

  const id = text(pick(src, 'id', '_id', 'client_id', 'clientId', 'patient_id', 'patientId', 'uuid', 'record_id', 'no'));
  if (!id) return null;

  const first = text(pick(src, 'first_name', 'firstName'));
  const last = text(pick(src, 'last_name', 'lastName'));
  const name = text(pick(src, 'name', 'full_name', 'fullName', 'client_name', 'clientName', 'patient_name')) || [first, last].filter(Boolean).join(' ');

  const dob = text(pick(src, 'dob', 'date_of_birth', 'dateOfBirth', 'birth_date', 'birthDate'));
  const age = numberOrNull(pick(src, 'age')) ?? (parseDate(dob) ? calculateAge(dob) : null);

  const firstAppointment = text(pick(src, 'first_appointment', 'firstAppointment'));
  const nextAppointment = text(pick(src, 'next_appointment', 'nextAppointment')) || (isFuture(firstAppointment) ? firstAppointment : '');

  const contact = pick(src, 'emergencyContact', 'emergency_contact');
  const contactObj = isObject(contact) ? contact : {};

  return {
    id,
    name,
    dob,
    age,
    gender: normalizeGender(pick(src, 'gender', 'sex')),
    email: text(pick(src, 'email', 'email_address')),
    phone: text(pick(src, 'phone', 'mobile', 'phone_number', 'phoneNumber')),
    address: text(pick(src, 'address', 'home_address')),
    primaryCondition: text(pick(src, 'primary_condition', 'primaryCondition', 'condition', 'diagnosis')),
    secondaryConditions: list(pick(src, 'secondary_conditions', 'secondaryConditions')),
    allergies: list(pick(src, 'allergies')),
    medications: list(pick(src, 'medications', 'current_medications')),
    medicalHistory: text(pick(src, 'medical_history', 'medicalHistory', 'history')),
    lastVisit: text(pick(src, 'last_visit', 'lastVisit', 'last_visit_date')) || null,
    nextAppointment: nextAppointment || null,
    status: normalizeStatus(pick(src, 'status', 'patient_status')),
    doctor: text(pick(src, 'assigned_doctor', 'assignedDoctor', 'doctor', 'doctor_name', 'doctorName')),
    notes: text(pick(src, 'notes', 'note')),
    insuranceProvider: text(pick(src, 'insurance_provider', 'insuranceProvider', 'insurance')),
    policyNumber: text(pick(src, 'policy_number', 'policyNumber')),
    totalVisits: numberOrNull(pick(src, 'total_visits', 'totalVisits', 'visit_count')),
    emergencyContact: {
      name: text(contactObj.name) || text(pick(src, 'emergency_contact_name', 'emergencyName')),
      phone: text(contactObj.phone) || text(pick(src, 'emergency_contact_phone', 'emergencyPhone')),
      relation: text(contactObj.relation) || text(pick(src, 'emergency_contact_relation', 'emergencyRelation')),
    },
    createdAt: text(pick(src, 'created_at', 'createdAt', 'date_created', 'registered_at', 'timestamp')),
  };
}

export function toPatients(res: unknown): Patient[] {
  const rows = toArray<unknown>(res, 'clients', 'patients');
  const patients: Patient[] = [];
  let skipped = 0;
  for (const row of rows) {
    const patient = normalizePatient(row);
    if (patient) patients.push(patient);
    else skipped += 1;
  }
  // Records without any id can't be opened, so they are left out of the UI
  if (skipped > 0) console.warn(`[Patients] Skipped ${skipped} record(s) without an id.`);
  return patients;
}

/** GET the full patient list, or POST the search route when a query is given (it rejects an empty query). */
export async function fetchPatients(userId: string | number, query = ''): Promise<Patient[]> {
  const q = query.trim();
  const res = q
    ? await api.searchEntities<unknown>(CLIENT_SEARCH_ENDPOINT, { domain: MEDICAL_DOMAIN, user_id: userId, query: q })
    : await api.fetchList<unknown>(CLIENTS_ENDPOINT, api.getContextQuery(MEDICAL_DOMAIN, userId));
  return toPatients(res);
}

/** Loads one patient; falls back to scanning the list if the single-record route is missing. Null = not found. */
export async function fetchPatient(userId: string | number, id: string): Promise<Patient | null> {
  const query = api.getContextQuery(MEDICAL_DOMAIN, userId);
  try {
    const res = await api.fetchOne<unknown>(CLIENTS_ENDPOINT, id, query);
    // normalizePatient also looks inside { client: {...} } wrappers. Single-record payloads may omit
    // the id (it's already in the URL), so fall back to the requested id rather than "not found".
    const record = toRecord<Record<string, unknown>>(res);
    if (!record) return null;
    return normalizePatient(record) ?? normalizePatient({ id, ...record });
  } catch (err) {
    // 404 can mean either "no such patient" or "route missing"; the list settles which
    if (!isMissingEndpoint(err)) throw err;
    const all = await fetchPatients(userId);
    return all.find(p => p.id === id) ?? null;
  }
}

export type VisitRecord = {
  id: string;
  date: string;
  time: string;
  type: string;
  duration: number | null;
  notes: string;
  status: string;
};

/** Normalises the per-client appointment history into timeline entries. */
export function toVisits(res: unknown): VisitRecord[] {
  return toArray<unknown>(res, 'appointments', 'visits')
    .filter(isObject)
    .map((raw, i) => ({
      id: text(raw.id ?? raw.no) || String(i + 1),
      date: text(raw.date ?? raw.appointment_date ?? raw.start),
      time: text(raw.time ?? raw.start_time),
      type: text(raw.appointmentType ?? raw.appointment_type ?? raw.type ?? raw.title) || 'Visit',
      duration: numberOrNull(raw.duration),
      notes: text(raw.notes ?? raw.msg ?? raw.message),
      status: text(raw.status),
    }))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
}

export type AppointmentSlot = {
  no: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  msg: string;
  locked: boolean;
};

/** Normalises a day's appointment slots (same shape the Appointments page edits). */
export function toAppointmentSlots(rows: unknown[], date: string): AppointmentSlot[] {
  return rows.filter(isObject).map((raw, i) => ({
    no: text(raw.no ?? raw.number ?? raw.id) || String(i + 1),
    date,
    time: text(raw.time ?? raw.start_time ?? raw.slot),
    name: text(raw.name ?? raw.clientName ?? raw.attendeeName),
    phone: text(raw.phone ?? raw.mobile),
    msg: text(raw.msg ?? raw.message),
    locked: Boolean(raw.locked ?? raw.isLocked ?? raw.finalized ?? false),
  }));
}

/** A slot counts as booked once a patient name or a message is filled in. */
export const isBookedSlot = (slot: AppointmentSlot) => !!(slot.name || slot.msg);

/** Counts patients per value (e.g. condition or doctor), most common first. */
export function countBy(patients: Patient[], getKey: (p: Patient) => string): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of patients) {
    const key = getKey(p).trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Created this calendar month (local time). */
export function isNewThisMonth(patient: Patient, now = new Date()) {
  const created = parseDate(patient.createdAt);
  return !!created && created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
}
