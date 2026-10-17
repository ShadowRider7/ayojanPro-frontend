"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import Logo from "@/assets/svg/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGetMe } from "@/hooks";
import { APP_NAME, DASHBOARD_ROUTES } from "@/lib/constants";

const NAV_LINKS = [
  { name: "Home", url: "/" },
  { name: "Browse Professionals", url: "/professionals" },
];

const MOBILE_LINK_CLASS =
  "rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted";

export default function Header() {
  const { data, isPending } = useGetMe();
  const user = data?.data;
  const dashboardUrl = user ? DASHBOARD_ROUTES[user.role] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
        >
          <Logo className="size-7 text-primary" />
          <span>{APP_NAME}</span>
        </Link>

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
          {!isPending &&
            (user && dashboardUrl ? (
              <Button
                nativeButton={false}
                render={<Link href={dashboardUrl} />}
              >
                Dashboard
              </Button>
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
            ))}
        </div>

        <Sheet>
          <SheetTrigger
            className="md:hidden"
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
                  render={
                    <Link href={link.url} className={MOBILE_LINK_CLASS} />
                  }
                >
                  {link.name}
                </SheetClose>
              ))}
              {dashboardUrl ? (
                <SheetClose
                  render={
                    <Link href={dashboardUrl} className={MOBILE_LINK_CLASS} />
                  }
                >
                  Dashboard
                </SheetClose>
              ) : null}
            </nav>
            {!isPending && !user ? (
              <SheetFooter>
                <SheetClose
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
                  render={
                    <Link href="/register" className={buttonVariants()} />
                  }
                >
                  Get started
                </SheetClose>
              </SheetFooter>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
