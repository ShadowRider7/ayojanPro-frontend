"use client";

import { KeyRoundIcon, LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMe, useSignOut } from "@/hooks";
import { PROFILE_ROUTES } from "@/lib/constants";
import { initials } from "@/utils";

export function UserMenu() {
  const { data } = useGetMe();
  const { signOut, isPending: isLoggingOut } = useSignOut();

  const user = data?.data;

  if (!user) {
    return null;
  }

  const profileUrl = PROFILE_ROUTES[user.role];

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
        {/* The name only appears once the header has room for it. Below that
            the avatar alone keeps the menu bar from crowding the screen. */}
        <span className="hidden max-w-32 truncate font-medium text-sm xl:inline">
          {user.name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate font-medium text-foreground">
              {user.name}
            </span>
            <span className="truncate font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
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
          nativeButton={false}
          render={
            <Link
              href={`/forgot-password?email=${encodeURIComponent(user.email)}`}
            />
          }
        >
          <KeyRoundIcon />
          Forgot password
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={signOut}
          disabled={isLoggingOut}
        >
          <LogOutIcon />
          {isLoggingOut ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
