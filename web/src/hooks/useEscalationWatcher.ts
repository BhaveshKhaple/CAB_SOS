import { useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase.ts';

export function useEscalationWatcher() {
  useEffect(() => {
    const check = async () => {
      try {
        const now = Date.now();
        const q = query(
          collection(db, 'sos_alerts'),
          where('status', 'in', ['new', 'acknowledged'])
        );
        const snap = await getDocs(q);
        snap.forEach(async (docSnap) => {
          const deadline = docSnap.data().escalationDeadlineAt?.toMillis?.() ?? 0;
          if (now >= deadline) {
            try {
              await httpsCallable(functions, 'markEscalated')({ alertId: docSnap.id });
            } catch {
              // ignore race conditions
            }
          }
        });
      } catch {
        // ignore network errors during polling
      }
    };

    check();
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, []);
}
