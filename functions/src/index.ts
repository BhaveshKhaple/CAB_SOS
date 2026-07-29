import { initializeApp } from 'firebase-admin/app';
initializeApp();

export { ingestSos } from './ingestSos.js';
export {
  markAcknowledged,
  markEscalated,
  markVerified,
  markFalseAlarm,
  resolveIncident,
} from './alerts.js';
export { mintEvidenceUrl } from './evidence.js';
export { queueContactNotification, queuePoliceNotification } from './outbox.js';
export { seed } from './seed.js';
export { simulateSos } from './simulator.js';
