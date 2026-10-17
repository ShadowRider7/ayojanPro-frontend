import { BriefcaseIcon, UsersIcon } from "lucide-react";
import { Container } from "@/components/shared";

const CLIENT_STEPS = [
  {
    title: "Create your event",
    description:
      "Describe the occasion, your budget and the services you need — photography, decoration, sound and more.",
  },
  {
    title: "Review proposals",
    description:
      "Verified professionals respond with itemised offers for each requirement. Compare and pick the best fit.",
  },
  {
    title: "Contract & pay securely",
    description:
      "Accept an offer to generate a contract, then pay the initial milestone through the platform.",
  },
  {
    title: "Get it delivered & reviewed",
    description:
      "Track deliverables, release the final payment and leave a review once the work is complete.",
  },
];

const PROFESSIONAL_STEPS = [
  {
    title: "Apply & get verified",
    description:
      "Submit your profile, resume and portfolio. Our team reviews every application before it goes live.",
  },
  {
    title: "Build your storefront",
    description:
      "Publish your services, skills, experience and portfolio so clients know exactly what you offer.",
  },
  {
    title: "Browse events & propose",
    description:
      "Find published events that match your craft and submit itemised proposals for the requirements.",
  },
  {
    title: "Deliver & get paid",
    description:
      "Upload deliverables against the contract and receive milestone payments as work is approved.",
  },
];

type Column = {
  icon: typeof UsersIcon;
  title: string;
  description: string;
  steps: { title: string; description: string }[];
};

const COLUMNS: Column[] = [
  {
    icon: UsersIcon,
    title: "For clients",
    description: "Plan and book without the back-and-forth.",
    steps: CLIENT_STEPS,
  },
  {
    icon: BriefcaseIcon,
    title: "For professionals",
    description: "Find work and get paid on time.",
    steps: PROFESSIONAL_STEPS,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            How AyojanPro works
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            One workflow for both sides of the event — from the first brief to
            the final review.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {COLUMNS.map((column) => (
            <div
              key={column.title}
              className="flex flex-col gap-6 rounded-xl border bg-card p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <column.icon className="size-5" />
                </span>
                <div>
                  <p className="font-heading text-lg font-medium">
                    {column.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {column.description}
                  </p>
                </div>
              </div>

              <ol className="flex flex-col gap-5">
                {column.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
