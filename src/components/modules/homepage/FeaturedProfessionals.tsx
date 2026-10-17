"use client";

import { StarIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Container, EmptyState, ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProfessionals } from "@/hooks";
import type { IQuery, PublicProfessional } from "@/types";
import { toNumber } from "@/utils";

/** Top-rated approved professionals shown on the landing page. */
const FEATURED_QUERY: IQuery = {
  limit: 4,
  sortBy: "averageRating",
  sortOrder: "desc",
};

/** Stable keys for the loading placeholder cards. */
const SKELETON_KEYS = ["first", "second", "third", "fourth"];

function ProfessionalCard({
  professional,
}: {
  professional: PublicProfessional;
}) {
  const rating = toNumber(professional.averageRating) ?? 0;
  const skills = professional.skills?.map((item) => item.skill.name) ?? [];
  const serviceCount = professional.services?.length ?? 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="truncate">{professional.name}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {professional.professionalTitle}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {rating.toFixed(1)}
            <StarIcon className="fill-current" />
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {professional.bio ?? "This professional has not added a bio yet."}
        </p>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {professional.experienceYears} yrs · {serviceCount} service
          {serviceCount === 1 ? "" : "s"}
        </span>
        <Button
          variant="link"
          size="sm"
          nativeButton={false}
          render={<Link href={`/professionals/${professional.id}`} />}
        >
          View profile
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProfessionalCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-4xl" />
          <Skeleton className="h-5 w-20 rounded-4xl" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-3 w-28" />
      </CardFooter>
    </Card>
  );
}

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
