import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/assets/svg/Logo";

export default function AuthenticationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-muted px-4 py-10">
      <Link href="/" className="flex items-center gap-2">
        <span className="block h-9 w-[92px]">
          <Logo />
        </span>
        <span className="font-heading text-xl font-semibold tracking-tight">
          AyojanPro
        </span>
      </Link>
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
