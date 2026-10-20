import type { ReactNode } from "react";
import AuthGuard from "@/components/auth/auth-guard";

export default function ProfessionalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGuard roles={["PROFESSIONAL"]}>{children}</AuthGuard>;
}
