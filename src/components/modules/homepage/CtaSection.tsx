import Link from "next/link";
import { Container } from "@/components/shared";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-2xl border bg-primary/5 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ready to make your next event unforgettable?
          </h2>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Join AyojanPro as a client to book verified professionals, or apply
            as a professional to grow your event business.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Create a free account
            </Button>
            <Button
              variant="outline"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<Link href="/apply-as-professional" />}
            >
              Apply as a professional
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
