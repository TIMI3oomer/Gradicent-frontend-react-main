import type { Appointment } from '../types';

const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().split('T')[0];
};

export const mockAppointments: Appointment[] = [
  {
    id: 'APT-001', title: 'Annual Check-up - Sarah Johnson', date: d(0), time: '08:30',
    duration: 45, type: 'Medical', appointmentType: 'Check-up',
    status: 'Scheduled', attendeeId: 'PAT-001', attendeeName: 'Sarah Johnson',
    hostName: 'Dr. Sarah Chen', location: 'Exam Room 2', notes: 'Annual physical',
    colorCode: '#4CAF7D',
  },
  {
    id: 'APT-002', title: 'Diabetes Follow-up - Marcus Williams', date: d(0), time: '09:30',
    duration: 30, type: 'Medical', appointmentType: 'Follow-up',
    status: 'Scheduled', attendeeId: 'PAT-002', attendeeName: 'Marcus Williams',
    hostName: 'Dr. James Park', location: 'Exam Room 1', notes: 'Review HbA1c results',
    colorCode: '#78CEE6',
  },
  {
    id: 'APT-003', title: 'Asthma Review - Elena Rodriguez', date: d(0), time: '10:15',
    duration: 30, type: 'Medical', appointmentType: 'Follow-up',
    status: 'Scheduled', attendeeId: 'PAT-003', attendeeName: 'Elena Rodriguez',
    hostName: 'Dr. Sarah Chen', location: 'Exam Room 3', notes: 'Lung function test',
    colorCode: '#78CEE6',
  },
  {
    id: 'APT-004', title: 'Cardiac Check - David Kim', date: d(0), time: '11:00',
    duration: 60, type: 'Medical', appointmentType: 'Procedure',
    status: 'Scheduled', attendeeId: 'PAT-004', attendeeName: 'David Kim',
    hostName: 'Dr. Michael Torres', location: 'Cardiology Suite', notes: 'Stress test',
    colorCode: '#CE7A35',
  },
  {
    id: 'APT-005', title: 'Osteoporosis - Patricia Thompson', date: d(0), time: '13:00',
    duration: 30, type: 'Medical', appointmentType: 'Check-up',
    status: 'Completed', attendeeId: 'PAT-005', attendeeName: 'Patricia Thompson',
    hostName: 'Dr. James Park', location: 'Exam Room 1', notes: 'DEXA scan results',
    colorCode: '#4CAF7D',
  },
  {
    id: 'APT-006', title: 'ADHD Follow-up - James O\'Brien', date: d(0), time: '14:00',
    duration: 30, type: 'Medical', appointmentType: 'Follow-up',
    status: 'Scheduled', attendeeId: 'PAT-006', attendeeName: 'James O\'Brien',
    hostName: 'Dr. Sarah Chen', location: 'Exam Room 2', notes: 'Medication adjustment review',
    colorCode: '#78CEE6',
  },
  {
    id: 'APT-007', title: 'Emergency - Rosa Martinez', date: d(0), time: '15:30',
    duration: 60, type: 'Medical', appointmentType: 'Emergency',
    status: 'Scheduled', attendeeId: 'PAT-009', attendeeName: 'Rosa Martinez',
    hostName: 'Dr. Michael Torres', location: 'Urgent Care Suite', notes: 'Chest pain complaint',
    colorCode: '#D95C5C',
  },
  {
    id: 'APT-008', title: 'Annual Check-up - Tyler Brooks', date: d(1), time: '09:00',
    duration: 45, type: 'Medical', appointmentType: 'Check-up',
    status: 'Scheduled', attendeeId: 'PAT-010', attendeeName: 'Tyler Brooks',
    hostName: 'Dr. James Park', location: 'Exam Room 1', notes: 'A1C and blood work',
    colorCode: '#4CAF7D',
  },
  {
    id: 'APT-009', title: 'RA Monitoring - Mei-Ling Zhang', date: d(1), time: '10:30',
    duration: 45, type: 'Medical', appointmentType: 'Follow-up',
    status: 'Scheduled', attendeeId: 'PAT-007', attendeeName: 'Mei-Ling Zhang',
    hostName: 'Dr. Michael Torres', location: 'Rheumatology Suite', notes: 'Labs review',
    colorCode: '#78CEE6',
  },
  {
    id: 'APT-010', title: 'Anxiety Check-in - Anthony Davis', date: d(2), time: '11:00',
    duration: 30, type: 'Medical', appointmentType: 'Consultation',
    status: 'Scheduled', attendeeId: 'PAT-008', attendeeName: 'Anthony Davis',
    hostName: 'Dr. Sarah Chen', location: 'Exam Room 3', notes: 'Medication compliance check',
    colorCode: '#78CEE6',
  },
  {
    id: 'APT-011', title: 'Sickle Cell - Samuel Osei', date: d(3), time: '09:30',
    duration: 45, type: 'Medical', appointmentType: 'Follow-up',
    status: 'Scheduled', attendeeId: 'PAT-012', attendeeName: 'Samuel Osei',
    hostName: 'Dr. James Park', location: 'Hematology Suite', notes: 'CBC review',
    colorCode: '#78CEE6',
  },
  {
    id: 'APT-012', title: 'MS Infusion - Diana Foster', date: d(4), time: '08:00',
    duration: 240, type: 'Medical', appointmentType: 'Procedure',
    status: 'Scheduled', attendeeId: 'PAT-013', attendeeName: 'Diana Foster',
    hostName: 'Dr. Michael Torres', location: 'Infusion Center', notes: 'Ocrelizumab infusion',
    colorCode: '#CE7A35',
  },
  {
    id: 'APT-013', title: 'JIA Follow-up - Olivia Grant', date: d(-1), time: '10:00',
    duration: 30, type: 'Medical', appointmentType: 'Check-up',
    status: 'Completed', attendeeId: 'PAT-015', attendeeName: 'Olivia Grant',
    hostName: 'Dr. Sarah Chen', location: 'Pediatric Suite', notes: 'Growth and development',
    colorCode: '#4CAF7D',
  },
  {
    id: 'APT-014', title: 'Business Strategy Review - TechVentures', date: d(0), time: '10:00',
    duration: 60, type: 'Business', appointmentType: 'Meeting',
    status: 'Scheduled', attendeeId: 'CLT-001', attendeeName: 'Alexandra Chen',
    hostName: 'Jordan Blake', location: 'Conference Room A', notes: 'Q4 roadmap review',
    colorCode: '#1171BB',
  },
  {
    id: 'APT-015', title: 'Onboarding - Kim Beauty Labs', date: d(1), time: '14:00',
    duration: 90, type: 'Business', appointmentType: 'Onboarding',
    status: 'Scheduled', attendeeId: 'CLT-013', attendeeName: 'Rachel Kim',
    hostName: 'Priya Sharma', location: 'Zoom', notes: 'Initial platform walkthrough',
    colorCode: '#22C55E',
  },
  {
    id: 'APT-016', title: 'QBR - Whitfield Capital', date: d(5), time: '13:00',
    duration: 120, type: 'Business', appointmentType: 'QBR',
    status: 'Scheduled', attendeeId: 'CLT-004', attendeeName: 'James Whitfield',
    hostName: 'Jordan Blake', location: 'Whitfield HQ, Boston', notes: 'Q4 business review',
    colorCode: '#FF9F1C',
  },
  {
    id: 'APT-017', title: 'Renewal Discussion - Stafford Logistics', date: d(-2), time: '11:00',
    duration: 60, type: 'Business', appointmentType: 'Renewal',
    status: 'Completed', attendeeId: 'CLT-014', attendeeName: 'Brian Stafford',
    hostName: 'Priya Sharma', location: 'Phone', notes: 'Renewed for 2 years',
    colorCode: '#4CAF7D',
  },
  {
    id: 'APT-018', title: 'Demo - Garcia Fine Dining', date: d(-3), time: '15:00',
    duration: 45, type: 'Business', appointmentType: 'Demo',
    status: 'Completed', attendeeId: 'CLT-015', attendeeName: 'Sofia Garcia',
    hostName: 'Lisa Nkomo', location: 'Zoom', notes: 'Converted to paying customer',
    colorCode: '#4CAF7D',
  },
  {
    id: 'APT-019', title: 'CHF Monitoring - Rosa Martinez', date: d(-1), time: '09:00',
    duration: 30, type: 'Medical', appointmentType: 'Check-up',
    status: 'Completed', attendeeId: 'PAT-009', attendeeName: 'Rosa Martinez',
    hostName: 'Dr. Michael Torres', location: 'Cardiology Suite', notes: 'INR 2.4 - within range',
    colorCode: '#4CAF7D',
  },
  {
    id: 'APT-020', title: 'New Patient - Kevin Nguyen', date: d(6), time: '14:30',
    duration: 60, type: 'Medical', appointmentType: 'Consultation',
    status: 'Scheduled', attendeeId: 'PAT-014', attendeeName: 'Kevin Nguyen',
    hostName: 'Dr. James Park', location: 'Exam Room 1', notes: 'First visit workup',
    colorCode: '#78CEE6',
  },
];
