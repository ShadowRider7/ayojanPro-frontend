"use client";

import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  ExternalLinkIcon,
  ImageIcon,
  MessageSquareIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Container,
  DateText,
  EmptyState,
  ErrorState,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicProfessional } from "@/hooks";
import type {
  Experience,
  PortfolioItem,
  ProfessionalService,
  Review,
} from "@/types";
import { formatCurrency, toNumber } from "@/utils";

/** How many reviews are shown before pointing at the full total. */
const REVIEWS_PREVIEW_LIMIT = 6;

function RatingBadge({ review }: { review: Review }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={
            star <= review.rating ? "size-3.5 fill-current" : "size-3.5"
          }
        />
      ))}
    </span>
  );
}

function formatPriceRange(service: ProfessionalService) {
  const min = toNumber(service.minimumPrice);
  const max = toNumber(service.maximumPrice);

  if (min !== null && max !== null) {
    return min === max
      ? formatCurrency(min)
      : `${formatCurrency(min)} – ${formatCurrency(max)}`;
  }

  if (min !== null) {
    return `From ${formatCurrency(min)}`;
  }

  if (max !== null) {
    return `Up to ${formatCurrency(max)}`;
  }

  return "";
}

function ServiceItem({ service }: { service: ProfessionalService }) {
  const price = formatPriceRange(service);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <CardTitle className="text-base">{service.name}</CardTitle>
        {price ? (
          <span className="shrink-0 text-sm font-medium tabular-nums">
            {price}
          </span>
        ) : null}
      </CardHeader>
      {service.description || service.pricingNote ? (
        <CardContent className="flex flex-col gap-2">
          {service.description ? (
            <p className="text-sm text-muted-foreground">
              {service.description}
            </p>
          ) : null}
          {service.pricingNote ? (
            <p className="text-xs text-muted-foreground">
              {service.pricingNote}
            </p>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

function ExperienceItem({ experience }: { experience: Experience }) {
  const period = experience.startDate ? (
    <>
      <DateText value={experience.startDate} />
      {experience.endDate ? (
        <>
          {" – "}
          <DateText value={experience.endDate} />
        </>
      ) : (
        " – Present"
      )}
    </>
  ) : null;

  return (
    <li className="flex flex-col gap-1 border-l-2 pl-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-heading text-sm font-medium">{experience.title}</p>
        {experience.organization ? (
          <span className="text-sm text-muted-foreground">
            · {experience.organization}
          </span>
        ) : null}
      </div>
      {period ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarIcon className="size-3.5" />
          {period}
        </p>
      ) : null}
      {experience.description ? (
        <p className="text-sm text-muted-foreground">
          {experience.description}
        </p>
      ) : null}
    </li>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <Card className="overflow-hidden pt-0">
      <div className="relative aspect-4/3 w-full bg-muted">
        {item.mediaUrl ? (
          <Image
            src={item.mediaUrl}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-6" />
          </span>
        )}
      </div>
      <CardHeader className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{item.title}</CardTitle>
          {item.eventType ? (
            <Badge variant="outline" className="shrink-0">
              {item.eventType}
            </Badge>
          ) : null}
        </div>
        {item.workDate ? (
          <p className="text-xs text-muted-foreground">
            <DateText value={item.workDate} />
          </p>
        ) : null}
      </CardHeader>
      {item.description || item.externalUrl ? (
        <CardContent className="flex flex-col gap-2">
          {item.description ? (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {item.description}
            </p>
          ) : null}
          {item.externalUrl ? (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View work
              <ExternalLinkIcon className="size-3.5" />
            </a>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <li className="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RatingBadge review={review} />
          <span className="text-sm font-medium">Verified client</span>
        </div>
        <span className="text-xs text-muted-foreground">
          <DateText value={review.createdAt} />
        </span>
      </div>
      {review.comment ? (
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      ) : null}
    </li>
  );
}

function ProfessionalProfileSkeleton() {
  return (
    <Container className="flex flex-col gap-6 py-12 sm:py-16">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </Container>
  );
}

type ProfessionalProfileProps = {
  professionalId: string;
};

/** `/professionals/[professionalId]` — full public profile of a professional. */
export default function ProfessionalProfile({
  professionalId,
}: ProfessionalProfileProps) {
  const { data, isPending, isError, error, refetch } =
    usePublicProfessional(professionalId);

  const professional = data?.data;

  if (isPending) {
    return <ProfessionalProfileSkeleton />;
  }

  if (isError || !professional) {
    return (
      <Container className="py-12 sm:py-16">
        <ErrorState
          title="Could not load this professional"
          description={
            isError
              ? undefined
              : "This profile may have been removed or is no longer available."
          }
          error={error}
          onRetry={refetch}
        />
      </Container>
    );
  }

  const rating = toNumber(professional.averageRating) ?? 0;
  const skills = professional.skills?.map((item) => item.skill.name) ?? [];
  const services = professional.services?.filter((item) => item.isActive) ?? [];
  const experiences = professional.experiences ?? [];
  const portfolio = professional.portfolioItems ?? [];
  const reviews = professional.reviews ?? [];
  const reviewPreview = reviews.slice(0, REVIEWS_PREVIEW_LIMIT);

  return (
    <Container className="flex flex-col gap-10 py-12 sm:py-16">
      <div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/professionals" />}
        >
          <ArrowLeftIcon />
          Back to professionals
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {professional.name}
              </h1>
              <p className="text-muted-foreground">
                {professional.professionalTitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {rating.toFixed(1)}
                <StarIcon className="fill-current" />
              </Badge>
              <Badge variant="outline">
                {professional.experienceYears} yrs experience
              </Badge>
              <Badge variant="outline">
                {professional.totalReviews} review
                {professional.totalReviews === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>

        {professional.bio ? (
          <CardContent className="border-t">
            <p className="text-sm text-muted-foreground">{professional.bio}</p>
          </CardContent>
        ) : null}
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Services
        </h2>
        {services.length === 0 ? (
          <EmptyState
            icon={BriefcaseIcon}
            title="No services listed"
            description="This professional has not published any services yet."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <ServiceItem key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Experience
        </h2>
        {experiences.length === 0 ? (
          <EmptyState
            icon={BriefcaseIcon}
            title="No experience listed"
            description="This professional has not added work history yet."
          />
        ) : (
          <ul className="flex flex-col gap-5">
            {experiences.map((experience) => (
              <ExperienceItem key={experience.id} experience={experience} />
            ))}
          </ul>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Portfolio
        </h2>
        {portfolio.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No portfolio yet"
            description="Past work will show up here once it is added."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Reviews
          {professional.totalReviews > 0 ? (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({professional.totalReviews})
            </span>
          ) : null}
        </h2>
        {reviewPreview.length === 0 ? (
          <EmptyState
            icon={MessageSquareIcon}
            title="No reviews yet"
            description="Reviews come from clients after a completed contract."
          />
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {reviewPreview.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </ul>
            {professional.totalReviews > reviewPreview.length ? (
              <p className="text-sm text-muted-foreground">
                Showing {reviewPreview.length} of {professional.totalReviews}{" "}
                reviews.
              </p>
            ) : null}
          </>
        )}
      </section>
    </Container>
  );
}
