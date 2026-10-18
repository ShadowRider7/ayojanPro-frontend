"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hooks";
import { PROFILE_ROUTES } from "@/lib/constants";
import { initials } from "@/utils";

export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useGetMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const user = data?.data;

  if (!user) {
    return null;
  }

  const profileUrl = PROFILE_ROUTES[user.role];

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Signed out",
          description: "You have been logged out.",
          type: "success",
        });

        queryClient.invalidateQueries({ queryKey: ["user"] });
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
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-9 gap-2 px-1.5 sm:px-2"
            aria-label="Account menu"
          />
        }
      >
        <Avatar size="sm">
          {user.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate font-medium text-sm sm:inline">
          {user.name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium text-foreground">
            {user.name}
          </span>
          <span className="truncate font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profileUrl ? (
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={profileUrl} />}
          >
            <UserIcon />
            Profile
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOutIcon />
          {isLoggingOut ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
