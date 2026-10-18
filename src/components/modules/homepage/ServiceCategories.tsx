import {
  CameraIcon,
  LightbulbIcon,
  MicIcon,
  MusicIcon,
  PartyPopperIcon,
  SparklesIcon,
  UtensilsCrossedIcon,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared";

const CATEGORIES = [
  {
    icon: CameraIcon,
    title: "Photography",
    searchTerm: "Photo",
    description: "Weddings, portraits and corporate coverage.",
  },
  {
    icon: VideoIcon,
    title: "Videography",
    searchTerm: "Video",
    description: "Highlight reels, live coverage and edits.",
  },
  {
    icon: PartyPopperIcon,
    title: "Decoration",
    searchTerm: "Decor",
    description: "Stage, floral and venue styling.",
  },
  {
    icon: SparklesIcon,
    title: "Makeup & Hair",
    searchTerm: "Makeup",
    description: "Bridal, party and on-set styling.",
  },
  {
    icon: MusicIcon,
    title: "Sound & DJ",
    searchTerm: "Sound",
    description: "Sound systems, DJs and live bands.",
  },
  {
    icon: LightbulbIcon,
    title: "Lighting",
    searchTerm: "Lighting",
    description: "Ambient, stage and architectural lighting.",
  },
  {
    icon: UtensilsCrossedIcon,
    title: "Catering",
    searchTerm: "Catering",
    description: "Menus, live counters and service staff.",
  },
  {
    icon: MicIcon,
    title: "Hosting & Anchor",
    searchTerm: "Anchor",
    description: "Emcees, anchors and event coordination.",
  },
];

export default function ServiceCategories() {
  return (
    <section className="border-y bg-muted/30 py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Services for every occasion
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            From intimate birthdays to full-scale conferences — find the right
            specialist for each part of your event.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.title}
              href={`/professionals?searchTerm=${encodeURIComponent(category.searchTerm)}`}
              className="flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <category.icon className="size-5" />
              </span>
              <p className="font-heading text-sm font-medium">
                {category.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
