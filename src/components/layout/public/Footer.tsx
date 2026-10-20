"use client";

import Link from "next/link";
import Logo from "@/assets/svg/Logo";
import { Container } from "@/components/shared";
import { useCanApplyAsProfessional } from "@/hooks";
import { APP_NAME, DASHBOARD_ROUTES, PROFILE_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FooterLink = {
  name: string;
  url: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const EXPLORE_LINKS: FooterLink[] = [
  { name: "Home", url: "/" },
  { name: "Browse Professionals", url: "/professionals" },
];

const GUEST_ACCOUNT_LINKS: FooterLink[] = [
  { name: "Log in", url: "/login" },
  { name: "Create an account", url: "/register" },
];

/**
 * The number of grid columns, including the brand block, per column count.
 * Tailwind needs the class names to be static, so they are listed here.
 */
const GRID_COLUMNS: Record<number, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export default function Footer() {
  const { user, canApply } = useCanApplyAsProfessional();

  const profileUrl = user ? (PROFILE_ROUTES[user.role] ?? null) : null;

  const accountLinks: FooterLink[] = user
    ? [
        { name: "Dashboard", url: DASHBOARD_ROUTES[user.role] },
        ...(profileUrl ? [{ name: "Profile", url: profileUrl }] : []),
      ]
    : GUEST_ACCOUNT_LINKS;

  const columns: FooterColumn[] = [
    { title: "Explore", links: EXPLORE_LINKS },
    // The application is only open to visitors without an account.
    ...(canApply
      ? [
          {
            title: "For professionals",
            links: [
              {
                name: "Apply as a professional",
                url: "/apply-as-professional",
              },
            ],
          },
        ]
      : []),
    {
      title: "Account",
      links: accountLinks,
    },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <Container
        className={cn(
          "grid gap-10 py-12 sm:grid-cols-2",
          GRID_COLUMNS[columns.length + 1] ?? "lg:grid-cols-4",
        )}
      >
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
          >
            <Logo className="size-7 text-primary" />
            <span>{APP_NAME}</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            The event-service platform that connects clients with verified
            professionals — from first idea to final review.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <p className="font-heading text-sm font-medium">{column.title}</p>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {APP_NAME}. All rights reserved.</p>
          <p>Built for planners, professionals and unforgettable events.</p>
        </Container>
      </div>
    </footer>
  );
}
