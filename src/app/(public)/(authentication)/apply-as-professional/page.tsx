import type { Metadata } from "next";
import AuthAside from "@/components/auth/auth-aside";
import RedirectIfAuthenticated from "@/components/auth/redirect-if-authenticated";
import ApplyAsProfessionalForm from "@/components/form/apply-as-professional-form";

export const metadata: Metadata = {
  title: "Apply as a professional",
  description:
    "Join AyojanPro as an event professional — submit your profile and resume, get verified by our team and start receiving client bookings.",
};

export default function ApplyAsProfessionalPage() {
  return (
    <div className="grid min-h-[calc(100svh-var(--spacing-header))] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-lg">
            <RedirectIfAuthenticated>
              <ApplyAsProfessionalForm />
            </RedirectIfAuthenticated>
          </div>
        </div>
      </div>
      <AuthAside
        image="/illustrations/auth/apply-as-professional.svg"
        title="Turn your craft into a steady stream of event bookings."
        description="Publish your services, respond to real event briefs and get paid through the platform — once our team verifies your application."
      />
    </div>
  );
}
