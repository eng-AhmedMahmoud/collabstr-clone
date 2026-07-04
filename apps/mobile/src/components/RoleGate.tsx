import type { ReactNode } from "react";
import { useAuth } from "@/auth/context";

type Role = "brand" | "creator" | "admin";

export function RoleGate({ roles, children, fallback }: { roles: Role[]; children: ReactNode; fallback?: ReactNode }) {
  const { me } = useAuth();
  if (!me || !roles.includes(me.role)) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
