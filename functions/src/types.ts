export type AlertStatus =
  | 'new'
  | 'acknowledged'
  | 'escalated'
  | 'verified'
  | 'false_alarm'
  | 'closed'
  | 'cancelled';

export type LogAction =
  | 'sos.ingested'
  | 'sos.acknowledged'
  | 'sos.escalated'
  | 'sos.verified'
  | 'sos.false_alarm'
  | 'sos.closed'
  | 'sos.cancelled'
  | 'evidence.accessed'
  | 'notification.queued'
  | 'settings.updated';

export interface SosIngestPayload {
  deviceId: string;
  vehicleId: string;
  tripId: string;
  location: { lat: number; lng: number; accuracyM?: number };
  triggeredAt: string;
  batteryPct?: number;
  signalDbm?: number;
  signature: string;
}

export interface AlertDoc {
  tripId: string;
  vehicleId: string;
  deviceId: string;
  triggeredAt: FirebaseFirestore.Timestamp;
  location: { lat: number; lng: number; accuracyM?: number };
  status: AlertStatus;
  escalationDeadlineAt: FirebaseFirestore.Timestamp;
  assignedOperatorId?: string;
  audioRef?: string;
  videoRef?: string;
  gpsTrackRef?: string;
  acknowledgedAt?: FirebaseFirestore.Timestamp;
  verifiedBy?: string;
  verifiedAt?: FirebaseFirestore.Timestamp;
  falseAlarmReason?: string;
  escalatedAt?: FirebaseFirestore.Timestamp;
  closedAt?: FirebaseFirestore.Timestamp;
  closedBy?: string;
  resolutionNotes?: string;
}
