import type { Metadata } from "next";
import ApplyForm from "@/components/form/apply-form";

export const metadata: Metadata = {
  title: "Apply as a professional",
  description:
    "Join AyojanPro as a professional and start receiving event requests.",
};

export default function ApplyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Apply as a professional
        </h1>
        <p className="text-sm text-muted-foreground">
          Tell us about your work. An admin reviews every application.
        </p>
      </div>
      <ApplyForm />
    </div>
  );
}
