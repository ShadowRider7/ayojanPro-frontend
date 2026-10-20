import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/public/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import Providers from "@/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AyojanPro",
    template: "%s | AyojanPro",
  },
  description:
    "AyojanPro connects clients planning events with verified professionals offering on-site services.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <Providers>
        <body className="flex min-h-full flex-col">
          <SidebarProvider className="flex min-h-0 w-full flex-1 flex-col">
            <Header />
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            <Toaster />
          </SidebarProvider>
        </body>
      </Providers>
    </html>
  );
}
