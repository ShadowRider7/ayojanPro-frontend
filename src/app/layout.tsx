import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Merriweather,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import Providers from "@/providers";

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
    default: "AyojanPro — Hire verified event professionals",
    template: "%s | AyojanPro",
  },
  description:
    "AyojanPro connects event organizers with verified professionals for photography, decoration, makeup, sound and more. Post an event, receive proposals, and hire with confidence.",
  openGraph: {
    type: "website",
    siteName: "AyojanPro",
    title: "AyojanPro — Hire verified event professionals",
    description:
      "Post an event, receive proposals from verified professionals, and hire with confidence.",
  },
  twitter: {
    card: "summary",
    title: "AyojanPro — Hire verified event professionals",
    description:
      "Post an event, receive proposals from verified professionals, and hire with confidence.",
  },
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
        ibmPlexSans.variable,
        merriweatherHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
