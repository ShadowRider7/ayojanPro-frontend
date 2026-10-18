import type { Metadata } from "next";
import { UserManagement } from "@/components/modules/admin/UserManagement";

export const metadata: Metadata = {
  title: "Users",
  description:
    "Manage all platform users — view their roles, change their account status, and more.",
};

export default function AdminUsersPage() {
  return <UserManagement />;
}
