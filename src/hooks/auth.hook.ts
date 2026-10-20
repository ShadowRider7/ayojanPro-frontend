import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  forgotPassword,
  getMe,
  googleOAuth,
  resetPassword,
  userLogin,
  userLogout,
  userRegistration,
  verifyAccount,
} from "@/api";
import { toast } from "@/components/ui/toast";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: verifyAccount,
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLogout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  });
}

export function useGoogleOAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: googleOAuth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    retry: false,
  });
}

/**
 * The signed-in user and whether the "apply as a professional" call to
 * action may be shown.
 *
 * The application endpoint creates a brand new account, so it only makes
 * sense for a visitor who is not signed in yet. A signed-in client or admin
 * who follows the link would only run into an "email already exists"
 * conflict, so every call to action that points at the application is
 * hidden for them.
 */
export function useCanApplyAsProfessional() {
  const { data, isPending } = useGetMe();
  const user = data?.data;

  return {
    user,
    isPending,
    canApply: !isPending && !user,
  };
}

/**
 * Sign the user out.
 *
 * The header and the account menu both offer a "Log out" action, so the
 * endpoint call, the toast and the redirect live here instead of being
 * copy-pasted into both components.
 */
export function useSignOut() {
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();

  const signOut = useCallback(() => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Signed out",
          description: "You have been logged out.",
          type: "success",
        });
        router.push("/");
      },
      onError: (err) => {
        toast.add({
          title: "Logout failed",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
      },
    });
  }, [logout, router]);

  return { signOut, isPending };
}
