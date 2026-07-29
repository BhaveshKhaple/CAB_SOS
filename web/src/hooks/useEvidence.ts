import { useCallback, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase.ts';

export function useEvidence() {
  const [loading, setLoading] = useState(false);

  const getSignedUrl = useCallback(async (evidenceId: string) => {
    setLoading(true);
    try {
      const fn = httpsCallable<{ evidenceId: string }, { url: string; type: string; expiresInSec: number }>(
        functions,
        'mintEvidenceUrl'
      );
      const res = await fn({ evidenceId });
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getSignedUrl, loading };
}
