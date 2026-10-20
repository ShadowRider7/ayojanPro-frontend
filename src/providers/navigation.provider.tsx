"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { hasAppHistory, recordVisitedPath } from "@/lib/navigation-history";

type NavigationContextValue = {
  /**
   * Go back to the page the visitor came from.
   *
   * `fallbackHref` is used when there is nothing to go back to — the page
   * was opened directly, in a new tab or from a shared link.
   */
  goBack: (fallbackHref: string) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

/**
 * Tracks the app navigation and offers a "go back" that follows the browser
 * history, so the visitor lands where they came from.
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    recordVisitedPath(pathname);
  }, [pathname]);

  const goBack = useCallback(
    (fallbackHref: string) => {
      if (hasAppHistory()) {
        router.back();
        return;
      }

      router.push(fallbackHref);
    },
    [router],
  );

  const value = useMemo(() => ({ goBack }), [goBack]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Go back to the previous page, or to `fallbackHref` when the visitor
 * arrived on the current page directly.
 */
export function useGoBack() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useGoBack must be used inside <NavigationProvider>");
  }

  return context.goBack;
}
