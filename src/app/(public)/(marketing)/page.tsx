import type { Metadata } from "next";
import CtaSection from "@/components/modules/homepage/CtaSection";
import EventTypeCategories from "@/components/modules/homepage/EventTypeCategories";
import FeaturedProfessionals from "@/components/modules/homepage/FeaturedProfessionals";
import Hero from "@/components/modules/homepage/Hero";
import HowItWorks from "@/components/modules/homepage/HowItWorks";
import ServiceCategories from "@/components/modules/homepage/ServiceCategories";

export const metadata: Metadata = {
  title: { absolute: "AyojanPro — Book trusted event professionals" },
  description:
    "Plan your event on AyojanPro and hire verified professionals for photography, videography, decoration, makeup, sound and more — with contracts, milestone payments and reviews built in.",
  keywords: [
    "event services",
    "event professionals",
    "wedding photographer",
    "event decoration",
    "hire event vendors",
    "AyojanPro",
  ],
  openGraph: {
    type: "website",
    siteName: "AyojanPro",
    title: "AyojanPro — Book trusted event professionals",
    description:
      "Hire verified event professionals for photography, videography, decoration, makeup, sound and more.",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <EventTypeCategories />
      <ServiceCategories />
      <FeaturedProfessionals />
      <CtaSection />
    </>
  );
}
