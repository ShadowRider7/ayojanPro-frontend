import RoleGuard from "@/components/auth/role-guard";

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard roles={["CLIENT", "PROFESSIONAL"]}>{children}</RoleGuard>;
}
