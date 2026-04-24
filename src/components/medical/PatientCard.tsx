import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Note, FirstAidKit } from 'phosphor-react';
const CalendarDots = Calendar;
const Stethoscope = FirstAidKit;
import { Avatar } from '../shared/Avatar';
import { Badge } from '../shared/Badge';
import { formatDate } from '../../lib/formatters';
import type { Patient } from '../../types';

interface PatientCardProps {
  patient: Patient;
  index?: number;
}

export function PatientCard({ patient, index = 0 }: PatientCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="patient-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={() => navigate(`/medical/patients/${patient.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="patient-card-header">
        <Avatar name={patient.name} size="md" />
        <div className="patient-card-id">{patient.id}</div>
        <Badge status={patient.status} size="sm" withDot={patient.status === 'Active'} />
      </div>

      <h3 className="patient-card-name">{patient.name}</h3>
      <div className="patient-card-meta">
        <span>{patient.age}y · {patient.gender}</span>
        <Badge variant="info" size="sm">{patient.primaryCondition}</Badge>
      </div>

      <div className="patient-card-detail">
        <Stethoscope size={12} aria-hidden="true" />
        <span>{patient.doctor}</span>
      </div>

      <div className="patient-card-detail">
        <CalendarDots size={12} aria-hidden="true" />
        <span>Last visit: {formatDate(patient.lastVisit, 'short')}</span>
      </div>

      {patient.nextAppointment ? (
        <div className="patient-card-next">
          Next: {formatDate(patient.nextAppointment, 'short')}
        </div>
      ) : (
        <div className="patient-card-no-appt">No upcoming appointment</div>
      )}

      <div className="patient-card-actions" onClick={e => e.stopPropagation()}>
        <button
          className="patient-action-btn"
          aria-label={`View ${patient.name}'s profile`}
          onClick={() => navigate(`/medical/patients/${patient.id}`)}
        >
          View Profile
        </button>
        <button
          className="patient-action-icon-btn"
          aria-label={`Add note for ${patient.name}`}
          title="Quick note"
        >
          <Note size={14} />
        </button>
        <button
          className="patient-action-icon-btn"
          aria-label={`Schedule appointment for ${patient.name}`}
          title="Schedule"
          onClick={() => navigate('/medical/appointments')}
        >
          <CalendarDots size={14} />
        </button>
      </div>
    </motion.div>
  );
}
