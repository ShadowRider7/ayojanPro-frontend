import type { Metadata } from "next";
import ApplyAsProfessionalForm from "@/components/form/apply-as-professional-form";

export const metadata: Metadata = {
  title: "Apply as a professional",
  description:
    "Join AyojanPro as an event professional — submit your profile and resume, get verified by our team and start receiving client bookings.",
};

export default function ApplyAsProfessionalPage() {
  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-lg">
            <ApplyAsProfessionalForm />
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/60" />
        <div className="relative flex h-full flex-col justify-end gap-3 p-10 text-primary-foreground">
          <p className="max-w-sm text-2xl font-semibold tracking-tight text-balance">
            Turn your craft into a steady stream of event bookings.
          </p>
          <p className="text-sm text-primary-foreground/80">
            Publish your services, respond to real event briefs and get paid
            through the platform — once our team verifies your application.
          </p>
        </div>
      </div>
    </div>
  );
}
