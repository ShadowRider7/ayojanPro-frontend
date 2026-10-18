import type { Metadata } from "next";
import { ClientProfile } from "@/components/modules/profile/ClientProfile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your AyojanPro profile details and photo.",
};

export default function ProfilePage() {
  return <ClientProfile />;
}
