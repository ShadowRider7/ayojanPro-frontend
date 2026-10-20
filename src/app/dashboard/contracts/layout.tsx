import type { ReactNode } from "react";
import AuthGuard from "@/components/auth/auth-guard";

export default function ContractsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard roles={["CLIENT", "PROFESSIONAL"]}>{children}</AuthGuard>;
}
