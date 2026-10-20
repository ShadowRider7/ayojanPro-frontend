import type { ReactNode } from "react";
import AuthGuard from "@/components/auth/auth-guard";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <AuthGuard roles={["CLIENT"]}>{children}</AuthGuard>;
}
