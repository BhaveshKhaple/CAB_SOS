import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import type { MockMessage } from '../types/index.ts';

export function useMockOutbox(max = 50) {
  const [messages, setMessages] = useState<MockMessage[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'mock_outbox'), orderBy('createdAt', 'desc'), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      const items: MockMessage[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          ...d,
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
        } as MockMessage);
      });
      setMessages(items);
    });
    return unsub;
  }, [max]);

  return messages;
}
