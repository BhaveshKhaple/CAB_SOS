import { useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase.ts';

export function useEscalationWatcher() {
  useEffect(() => {
    const q = query(
      collection(db, 'sos_alerts'),
      where('status', 'in', ['new', 'acknowledged']),
      where('escalationDeadlineAt', '<=', new Date())
    );
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          try {
            await httpsCallable(functions, 'markEscalated')({ alertId: change.doc.id });
          } catch {
            // ignore race conditions
          }
        }
      });
    });
    return () => unsub();
  }, []);
}
