import { FileCheck2Icon, ShieldCheckIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared";
import { Button } from "@/components/ui/button";

const HIGHLIGHTS = [
  {
    icon: ShieldCheckIcon,
    title: "Verified professionals",
    description:
      "Every profile is reviewed and approved before it appears in the marketplace.",
  },
  {
    icon: FileCheck2Icon,
    title: "Contracts & secure payments",
    description:
      "Agree on scope and milestones, then pay through the platform — no cash guessing.",
  },
  {
    icon: StarIcon,
    title: "Reviews from real events",
    description:
      "Ratings come from completed contracts, so you know what to expect on the day.",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-linear-to-b from-primary/5 via-background to-background">
      <Container className="flex flex-col items-center gap-10 py-16 text-center sm:py-20 lg:py-28">
        <div className="flex flex-col items-center gap-5">
          <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Events, end to end
          </span>
          <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Book trusted event professionals for your next event
          </h1>
          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            AyojanPro brings clients and vetted vendors together. Post what your
            event needs, compare proposals, sign contracts and pay securely —
            all in one place.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            className="h-11 px-6 text-base"
            nativeButton={false}
            render={<Link href="/professionals" />}
          >
            Browse professionals
          </Button>
          <Button
            variant="outline"
            className="h-11 px-6 text-base"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Create a free account
          </Button>
        </div>

        <Link
          href="/apply-as-professional"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Are you a professional? Apply to join AyojanPro
        </Link>

        <div className="grid w-full gap-4 border-t pt-10 text-left sm:grid-cols-3">
          {HIGHLIGHTS.map((highlight) => (
            <div key={highlight.title} className="flex flex-col gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <highlight.icon className="size-4.5" />
              </span>
              <p className="font-heading text-sm font-medium">
                {highlight.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
