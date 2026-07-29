import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import type { Admin, Role } from '../types/index.ts';

interface AuthContextValue {
  user: User | null;
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubAdmin = () => {};
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        unsubAdmin();
        unsubAdmin = onSnapshot(doc(db, 'admins', u.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Admin;
            setAdmin({ ...data, uid: u.uid });
          } else {
            setAdmin(null);
          }
          setLoading(false);
        });
      } else {
        setAdmin(null);
        setLoading(false);
      }
    });
    return () => {
      unsub();
      unsubAdmin();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const ref = doc(db, 'admins', cred.user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
    }
  };

  const logout = async () => signOut(auth);

  const hasRole = (roles: Role[]) => !!admin && roles.includes(admin.role);

  return (
    <AuthContext.Provider value={{ user, admin, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
