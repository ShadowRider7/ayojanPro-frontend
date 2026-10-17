"use client";

import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMe } from "@/api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGoogleOAuth } from "@/hooks";
import { DASHBOARD_ROUTES } from "@/lib/constants";

/**
 * Whether Google sign-in is configured. `GoogleAuthProvider` skips mounting the
 * GIS provider when the client ID is missing, and `<GoogleLogin>` throws if it
 * renders outside that provider — so callers must not render the button (or its
 * "Or continue with" separator) when this is `false`.
 */
export const isGoogleAuthConfigured = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
);

/**
 * Google sign-in button shared by the register and login screens. On success
 * the backend sets the session cookies, so we only refresh `["user"]` and send
 * the browser to the dashboard for the account's role.
 */
export default function GoogleLoginComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: googleLogin, isPending } = useGoogleOAuth();

  if (!isGoogleAuthConfigured) {
    return null;
  }

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.add({
        title: "Google sign-in failed",
        description: "We could not read your Google credential. Please retry.",
        type: "error",
      });
      return;
    }

    googleLogin(
      { idToken },
      {
        onSuccess: async () => {
          toast.add({
            title: "Signed in with Google",
            description: "Welcome to AyojanPro",
            type: "success",
          });

          queryClient.invalidateQueries({ queryKey: ["user"] });

          let destination = "/dashboard";
          try {
            const me = await queryClient.fetchQuery({
              queryKey: ["user"],
              queryFn: getMe,
              retry: false,
            });
            destination = DASHBOARD_ROUTES[me.data.role] ?? destination;
          } catch {
            // Fall back to the client dashboard when the session read fails.
          }

          router.push(destination);
        },
        onError: (err) => {
          toast.add({
            title: "Google sign-in failed",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      },
    );
  };

  const handleError = () => {
    toast.add({
      title: "Google sign-in failed",
      description: "Something went wrong. Please try again",
      type: "error",
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <GoogleLogin
        theme="outline"
        shape="pill"
        text="continue_with"
        onSuccess={handleSuccess}
        onError={handleError}
      />
      {isPending ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Spinner className="size-3" /> Signing you in…
        </p>
      ) : null}
    </div>
  );
}
