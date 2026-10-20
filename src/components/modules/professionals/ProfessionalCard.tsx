import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
import type { PublicProfessional } from "@/types";
import { initials, toNumber } from "@/utils";

type ProfessionalCardProps = {
  professional: PublicProfessional;
};

export default function ProfessionalCard({
  professional,
}: ProfessionalCardProps) {
  const rating = toNumber(professional.averageRating) ?? 0;
  const skills = professional.skills?.map((item) => item.skill.name) ?? [];
  const serviceCount = professional.services?.length ?? 0;
  const imageUrl = professional.user?.imageUrl ?? null;
  const fallbackInitials =
    initials(professional.name) ||
    professional.name.slice(0, 2).toUpperCase() ||
    "?";

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-3">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={professional.name}
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            {fallbackInitials}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <CardTitle className="truncate text-base sm:text-lg">
            {professional.name}
          </CardTitle>
          <p className="truncate text-sm text-muted-foreground">
            {professional.professionalTitle}
          </p>
        </div>

        <Badge variant="secondary" className="shrink-0 gap-1">
          {rating.toFixed(1)}
          <StarIcon className="size-3 fill-current" />
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {professional.bio ?? "This professional has not added a bio yet."}
        </p>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted-foreground">
          {professional.experienceYears} yrs · {serviceCount} service
          {serviceCount === 1 ? "" : "s"}
        </span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          nativeButton={false}
          render={<Link href={`/professionals/${professional.id}`} />}
        >
          View profile
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProfessionalCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start gap-3">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
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
