import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth.tsx';
import type { Role } from '../../types/index.ts';

export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { hasRole, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!hasRole(allow)) return <div className="card">You do not have permission to view this page.</div>;
  return <>{children}</>;
}
