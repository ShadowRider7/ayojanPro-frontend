import type { ReactNode } from "react";
import Footer from "@/components/layout/public/Footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
