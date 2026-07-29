export type Role = 'operator' | 'supervisor' | 'admin';

export interface Admin {
  uid: string;
  name: string;
  email: string;
  role: Role;
}

export type AlertStatus =
  | 'new'
  | 'acknowledged'
  | 'escalated'
  | 'verified'
  | 'false_alarm'
  | 'closed'
  | 'cancelled';

export interface SosAlert {
  id: string;
  tripId: string;
  vehicleId: string;
  deviceId: string;
  triggeredAt: Date;
  location: { lat: number; lng: number; accuracyM?: number };
  status: AlertStatus;
  escalationDeadlineAt: Date;
  assignedOperatorId?: string;
  audioRef?: string;
  videoRef?: string;
  gpsTrackRef?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  acknowledgedAt?: Date;
  falseAlarmReason?: string;
  escalatedAt?: Date;
  closedAt?: Date;
  closedBy?: string;
  resolutionNotes?: string;
  batteryPct?: number;
  signalDbm?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  verificationStatus: string;
  rating: number;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  currentDriverId: string;
  deviceId: string;
  status: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  passengerRef: string;
  startTime: Date;
  endTime?: Date;
  status: 'ongoing' | 'completed' | 'sos_triggered';
  route: GpsPoint[];
  sosAlertId?: string;
}

export interface GpsPoint {
  lat: number;
  lng: number;
  ts: Date;
  speed?: number;
}

export interface Evidence {
  id: string;
  alertId: string;
  type: 'audio' | 'video' | 'gps_track';
  storagePath: string;
  capturedAt: Date;
}

export interface MockMessage {
  id: string;
  alertId: string;
  channel: 'contact' | 'police';
  toName: string;
  toPhone: string;
  body: string;
  status: 'queued' | 'sent' | 'failed';
  createdAt: Date;
}

export interface Incident {
  id: string;
  alertId: string;
  category: string;
  timeline: TimelineEntry[];
  resolutionNotes?: string;
  closedBy?: string;
  closedAt?: Date;
}

export interface TimelineEntry {
  at: Date;
  note: string;
  actorType: 'device' | 'human' | 'system';
  actorId?: string;
}

export interface EmergencyContact {
  id: string;
  passengerRef: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}
