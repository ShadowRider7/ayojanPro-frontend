"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGetMe } from "@/hooks";
import { DASHBOARD_ROUTES } from "@/lib/constants";

export default function RedirectIfAuthenticated() {
  const router = useRouter();
  const { data, isPending } = useGetMe();
  const user = data?.data;

  useEffect(() => {
    if (isPending || !user) {
      return;
    }
    router.replace(DASHBOARD_ROUTES[user.role] ?? "/dashboard");
  }, [isPending, user, router]);

  return null;
}
