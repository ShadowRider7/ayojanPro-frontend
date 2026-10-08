import type { Metadata } from "next";
import RegisterForm from "@/components/form/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a client account on AyojanPro.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Hire trusted professionals for your events.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
