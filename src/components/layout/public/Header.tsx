"use client";

import {
  BellIcon,
  CheckIcon,
  LayoutDashboardIcon,
  MenuIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Logo from "@/assets/svg/Logo";
import { NotificationBell } from "@/components/account/notification-bell";
import { UserMenu } from "@/components/account/user-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe, useSignOut } from "@/hooks";
import {
  APP_NAME,
  DASHBOARD_ROUTES,
  EVENT_TYPE_OPTIONS,
  PROFILE_ROUTES,
} from "@/lib/constants";
import {
  ALL_EVENT_TYPES,
  EVENTS_PATH,
  eventTypeHref,
  initials,
  normalizeEventType,
} from "@/utils";

const NAV_LINKS = [
  { name: "Home", url: "/" },
  { name: "Events", url: EVENTS_PATH },
  { name: "Browse Professionals", url: "/professionals" },
];

const MOBILE_LINK_CLASS =
  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted";

/**
 * The event type the events board is currently filtered by.
 *
 * `useSearchParams` may only be read from a subtree that is mounted after
 * the page has been prerendered, so this hook lives in the header menus —
 * they are only mounted once they are opened. The header itself must never
 * call it, or every page would lose its static shell.
 */
function useActiveEventType() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname !== EVENTS_PATH) {
    return null;
  }

  return normalizeEventType(searchParams.get("eventType"));
}

function EventTypeSheetLinks() {
  const activeEventType = useActiveEventType();

  return (
    <>
      <SheetClose
        nativeButton={false}
        render={<Link href={EVENTS_PATH} className={MOBILE_LINK_CLASS} />}
      >
        All events
        {activeEventType === ALL_EVENT_TYPES ? (
          <CheckIcon className="ml-auto size-4" />
        ) : null}
      </SheetClose>
      {EVENT_TYPE_OPTIONS.map((option) => (
        <SheetClose
          key={option.value}
          nativeButton={false}
          render={
            <Link
              href={eventTypeHref(option.value)}
              className={MOBILE_LINK_CLASS}
            />
          }
        >
          {option.label}
          {option.value === activeEventType ? (
            <CheckIcon className="ml-auto size-4" />
          ) : null}
        </SheetClose>
      ))}
    </>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { data, isPending } = useGetMe();
  const { signOut, isPending: isLoggingOut } = useSignOut();
  const user = data?.data;
  const dashboardUrl = user ? DASHBOARD_ROUTES[user.role] : null;
  const profileUrl = user ? PROFILE_ROUTES[user.role] : null;
  // The dashboard owns the sidebar, so the header carries its trigger.
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  return (
    <header className="sticky top-0 z-40 h-header w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {isDashboard ? (
            <>
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-1 h-4" />
            </>
          ) : null}
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
          >
            <Logo className="size-7 text-primary" />
            <span>{APP_NAME}</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isPending ? (
            user ? (
              <>
                {dashboardUrl ? (
                  <Button
                    nativeButton={false}
                    render={<Link href={dashboardUrl} />}
                  >
                    <LayoutDashboardIcon />
                    Dashboard
                  </Button>
                ) : null}
                <NotificationBell />
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Log in
                </Link>
                <Link href="/register" className={buttonVariants()}>
                  Get started
                </Link>
              </>
            )
          ) : null}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {!isPending && user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : null}

          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              render={<Button variant="ghost" size="icon" />}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Logo className="size-6 text-primary" />
                  {APP_NAME}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.url}
                    nativeButton={false}
                    render={
                      <Link href={link.url} className={MOBILE_LINK_CLASS} />
                    }
                  >
                    {link.name}
                  </SheetClose>
                ))}
                <p className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase">
                  Event types
                </p>
                <EventTypeSheetLinks />
              </nav>
              {!isPending ? (
                user ? (
                  <SheetFooter className="flex-col items-stretch gap-1">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar size="sm">
                        {user.imageUrl ? (
                          <AvatarImage src={user.imageUrl} alt="" />
                        ) : null}
                        <AvatarFallback>{initials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-sm">
                          {user.name}
                        </span>
                        <span className="truncate text-muted-foreground text-xs">
                          {user.email}
                        </span>
                      </span>
                    </div>
                    {dashboardUrl ? (
                      <SheetClose
                        nativeButton={false}
                        render={
                          <Link
                            href={dashboardUrl}
                            className={MOBILE_LINK_CLASS}
                          />
                        }
                      >
                        <LayoutDashboardIcon className="size-4" />
                        Dashboard
                      </SheetClose>
                    ) : null}
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/dashboard/notifications"
                          className={MOBILE_LINK_CLASS}
                        />
                      }
                    >
                      <BellIcon className="size-4" />
                      Notifications
                    </SheetClose>
                    {profileUrl ? (
                      <SheetClose
                        nativeButton={false}
                        render={
                          <Link
                            href={profileUrl}
                            className={MOBILE_LINK_CLASS}
                          />
                        }
                      >
                        <UserIcon className="size-4" />
                        Profile
                      </SheetClose>
                    ) : null}
                    <SheetClose
                      render={
                        <Button
                          variant="outline"
                          onClick={signOut}
                          disabled={isLoggingOut}
                          className="w-full justify-start"
                        />
                      }
                    >
                      {isLoggingOut ? (
                        <>
                          <Spinner className="size-3.5" /> Signing out
                        </>
                      ) : (
                        "Log out"
                      )}
                    </SheetClose>
                  </SheetFooter>
                ) : (
                  <SheetFooter>
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/login"
                          className={buttonVariants({ variant: "outline" })}
                        />
                      }
                    >
                      Log in
                    </SheetClose>
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link href="/register" className={buttonVariants()} />
                      }
                    >
                      Get started
                    </SheetClose>
                  </SheetFooter>
                )
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
