"use client";

import {
  type CredentialResponse,
  GoogleLogin as GoogleOAuthButton,
} from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { useGetMe, useGoogleOAuth } from "@/hooks";
import { dashboardPathForRole, errorMessage } from "@/lib/utils";

export default function GoogleLogin() {
  const router = useRouter();
  const { mutateAsync: googleLogin } = useGoogleOAuth();
  const { refetch } = useGetMe();

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.add({
        title: "Google sign-in failed",
        description: "No credential returned by Google.",
        type: "error",
      });
      return;
    }

    try {
      await googleLogin({ idToken });

      const me = await refetch();
      const user = me.data?.data;

      if (!user) {
        toast.add({
          title: "Session error",
          description: "Signed in, but your profile could not be loaded.",
          type: "error",
        });
        return;
      }

      toast.add({
        title: "Welcome back",
        description: `Logged in as ${user.name}`,
        type: "success",
      });
      router.push(dashboardPathForRole(user.role));
    } catch (error) {
      toast.add({
        title: "Google sign-in failed",
        description: errorMessage(error),
        type: "error",
      });
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleOAuthButton
        onSuccess={handleSuccess}
        onError={() => {
          toast.add({
            title: "Google sign-in failed",
            description: "Could not complete Google sign-in.",
            type: "error",
          });
        }}
        text="continue_with"
        shape="rectangular"
        size="large"
        width={320}
      />
    </div>
  );
}
