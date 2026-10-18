"use client";

import { UsersIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ProfessionalCard, {
  ProfessionalCardSkeleton,
} from "@/components/modules/professionals/ProfessionalCard";
import {
  Container,
  EmptyState,
  ErrorState,
  PaginationBar,
  SearchInput,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublicProfessionals } from "@/hooks";
import type { IQuery } from "@/types";

const PAGE_SIZE = 12;

const ALL_TITLES = "all-titles";

const SKELETON_KEYS = Array.from(
  { length: PAGE_SIZE },
  (_, index) => `professional-skeleton-${index}`,
);

export default function ProfessionalDirectory() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("searchTerm") ?? "",
  );
  const [professionalTitle, setProfessionalTitle] = useState(
    () => searchParams.get("professionalTitle") ?? "",
  );
  const [page, setPage] = useState(1);

  const query = useMemo<IQuery>(() => {
    const next: IQuery = { page, limit: PAGE_SIZE };

    if (searchTerm) {
      next.searchTerm = searchTerm;
    }

    if (professionalTitle) {
      next.professionalTitle = professionalTitle;
    }

    return next;
  }, [page, searchTerm, professionalTitle]);

  const { data, isPending, isError, error, refetch } =
    usePublicProfessionals(query);

  const professionals = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = Boolean(searchTerm || professionalTitle);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleTitleChange = useCallback((value: string | null) => {
    setProfessionalTitle(value && value !== ALL_TITLES ? value : "");
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setProfessionalTitle("");
    setPage(1);
  }, []);

  const titleItems = useMemo(() => {
    const titles = new Set(professionals.map((item) => item.professionalTitle));

    if (professionalTitle) {
      titles.add(professionalTitle);
    }

    return [
      { value: ALL_TITLES, label: "All titles" },
      ...[...titles]
        .sort((a, b) => a.localeCompare(b))
        .map((title) => ({ value: title, label: title })),
    ];
  }, [professionals, professionalTitle]);

  return (
    <section className="py-12 sm:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse professionals
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Every professional here has been reviewed and approved by AyojanPro.
            Search by name, service or city, then open a profile to see
            services, experience and reviews.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, service or city…"
            className="w-full sm:max-w-md"
          />
          {titleItems.length > 1 ? (
            <Select
              items={titleItems}
              value={professionalTitle || ALL_TITLES}
              onValueChange={handleTitleChange}
            >
              <SelectTrigger
                className="w-full sm:w-56"
                aria-label="Filter by title"
              >
                <SelectValue placeholder="All titles" />
              </SelectTrigger>
              <SelectContent>
                {titleItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKELETON_KEYS.map((key) => (
              <ProfessionalCardSkeleton key={key} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Could not load professionals"
            error={error}
            onRetry={refetch}
          />
        ) : professionals.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={
              hasFilters ? "No matching professionals" : "No professionals yet"
            }
            description={
              hasFilters
                ? "Try a different search term or clear the filters to see everyone."
                : "Approved professionals will appear here as soon as they join the marketplace."
            }
            action={
              hasFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {meta?.total ?? professionals.length} professional
              {(meta?.total ?? professionals.length) === 1 ? "" : "s"} found
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                />
              ))}
            </div>

            {meta ? (
              <PaginationBar
                page={meta.page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                pageSize={meta.limit}
                showSummary
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </Container>
    </section>
  );
}

export function ProfessionalDirectorySkeleton() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse professionals
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Every professional here has been reviewed and approved by AyojanPro.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <ProfessionalCardSkeleton key={key} />
          ))}
        </div>
      </Container>
    </section>
  );
}
