"use client";

import { UsersIcon } from "lucide-react";
import Link from "next/link";
import ProfessionalCard, {
  ProfessionalCardSkeleton,
} from "@/components/modules/professionals/ProfessionalCard";
import { Container, EmptyState, ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { usePublicProfessionals } from "@/hooks";
import type { IQuery } from "@/types";

const FEATURED_QUERY: IQuery = {
  limit: 4,
  sortBy: "averageRating",
  sortOrder: "desc",
};

const SKELETON_KEYS = ["first", "second", "third", "fourth"];

export default function FeaturedProfessionals() {
  const { data, isPending, isError, error, refetch } =
    usePublicProfessionals(FEATURED_QUERY);
  const professionals = data?.data ?? [];

  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Featured professionals
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Top-rated specialists on AyojanPro, ready to take on your event.
          </p>
        </div>

        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            title="No professionals yet"
            description="Approved professionals will appear here as soon as they join the marketplace."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                />
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/professionals" />}
              >
                View all professionals
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
