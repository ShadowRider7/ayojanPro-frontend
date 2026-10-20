import {
  BriefcaseIcon,
  BuildingIcon,
  CakeSliceIcon,
  CalendarHeartIcon,
  GraduationCapIcon,
  PartyPopperIcon,
  PresentationIcon,
  RocketIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared";

/**
 * The event types, each with an icon and a line about the work it usually
 * needs. The values match the `EventType` enum so every link lands on the
 * events board filtered by that type.
 */
const EVENT_TYPES = [
  {
    value: "WEDDING",
    icon: CalendarHeartIcon,
    title: "Weddings",
    description: "Photography, decoration, catering and music for the big day.",
  },
  {
    value: "WEDDING_RECEPTION",
    icon: SparklesIcon,
    title: "Receptions",
    description: "Hosts, stage setup and ambience for the evening reception.",
  },
  {
    value: "BIRTHDAY",
    icon: CakeSliceIcon,
    title: "Birthdays",
    description: "Cakes, decor, sound and photo coverage for birthdays.",
  },
  {
    value: "ANNIVERSARY",
    icon: UsersIcon,
    title: "Anniversaries",
    description: "Intimate setups, live music and keepsake photography.",
  },
  {
    value: "CORPORATE",
    icon: BuildingIcon,
    title: "Corporate",
    description: "Conferences, offsites, launches and office celebrations.",
  },
  {
    value: "CONFERENCE",
    icon: PresentationIcon,
    title: "Conferences",
    description: "Stage, sound, lighting and multi-day documentation.",
  },
  {
    value: "CONCERT",
    icon: PartyPopperIcon,
    title: "Concerts",
    description: "Live sound, lighting rigs and crowd photography.",
  },
  {
    value: "FESTIVAL",
    icon: RocketIcon,
    title: "Festivals",
    description: "Full-scale production across stalls, stages and artists.",
  },
  {
    value: "EXHIBITION",
    icon: BriefcaseIcon,
    title: "Exhibitions",
    description: "Booth builds, display lighting and event coverage.",
  },
  {
    value: "SPORTS",
    icon: TrophyIcon,
    title: "Sports",
    description: "Commentary, photography, highlights and venue setup.",
  },
  {
    value: "OTHER",
    icon: GraduationCapIcon,
    title: "Other events",
    description: "Anything else that needs professionals on the day.",
  },
] as const;

export default function EventTypeCategories() {
  return (
    <section className="border-y bg-muted/30 py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Every kind of event
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Pick an event type to see the professionals and services that
            occasion usually needs.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVENT_TYPES.map((eventType) => (
            <Link
              key={eventType.value}
              href={`/events?eventType=${encodeURIComponent(eventType.value)}`}
              className="flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <eventType.icon className="size-5" />
              </span>
              <p className="font-heading text-sm font-medium">
                {eventType.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {eventType.description}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
