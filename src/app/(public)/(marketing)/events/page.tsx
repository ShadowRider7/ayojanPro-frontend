import type { Metadata } from "next";
import { Suspense } from "react";
import EventBoard from "@/components/modules/events/EventBoard";

export const metadata: Metadata = {
  title: "Browse events",
  description:
    "Browse every published event looking for professionals on AyojanPro — filter by event type, city or service and send a proposal for the work you do.",
  openGraph: {
    type: "website",
    siteName: "AyojanPro",
    title: "Browse events | AyojanPro",
    description:
      "Find published events and the services they need, then send a proposal.",
  },
};

const SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `board-skeleton-${index}`,
);

export default function EventsPage() {
  return (
    <Suspense fallback={<EventBoardSkeleton />}>
      <EventBoard />
    </Suspense>
  );
}

function EventBoardSkeleton() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="h-9 w-64 rounded-lg bg-muted" />
          <div className="h-4 w-full max-w-2xl rounded-lg bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="h-48 rounded-xl border bg-card ring-1 ring-foreground/10"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
