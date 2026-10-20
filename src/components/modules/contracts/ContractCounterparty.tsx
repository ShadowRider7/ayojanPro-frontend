"use client";

import { MailIcon, MapPinIcon, PhoneIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Client, Professional } from "@/types";
import { initials, toNumber } from "@/utils";

type ProfileFact = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type ContractCounterpartyProps = {
  client: Client | null;
  professional: Professional | null;
  professionalId: string;
  isProfessional: boolean;
};

function joinLocation(parts: (string | null | undefined)[]) {
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ");
}

function ProfileFacts({ facts }: { facts: ProfileFact[] }) {
  if (facts.length === 0) {
    return null;
  }

  return (
    <dl className="grid gap-3 border-t pt-3 sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col gap-0.5">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
            {fact.icon}
            {fact.label}
          </dt>
          <dd className="text-sm break-words">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ClientCard({ client }: { client: Client | null }) {
  const user = client?.user ?? null;
  const name = user?.name ?? "Client";
  const imageUrl = user?.imageUrl ?? null;
  const location = joinLocation([
    client?.address,
    client?.city,
    client?.country,
  ]);

  const facts: ProfileFact[] = [];

  if (user?.email) {
    facts.push({
      label: "Email",
      value: user.email,
      icon: <MailIcon className="size-3.5" />,
    });
  }

  if (client?.phone) {
    facts.push({
      label: "Phone",
      value: client.phone,
      icon: <PhoneIcon className="size-3.5" />,
    });
  }

  if (location) {
    facts.push({
      label: "Location",
      value: location,
      icon: <MapPinIcon className="size-3.5" />,
    });
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Client</CardTitle>
        <CardDescription>
          The client who hired you for this contract — their contact details and
          profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="size-14">
            {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
            <AvatarFallback className="text-base">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <p className="font-heading text-base font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">Client</p>
          </div>
        </div>

        <ProfileFacts facts={facts} />

        {client?.bio ? (
          <div className="flex flex-col gap-1 border-t pt-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              About
            </p>
            <p className="text-sm text-muted-foreground">{client.bio}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProfessionalCard({
  professional,
  professionalId,
}: {
  professional: Professional | null;
  professionalId: string;
}) {
  const name = professional?.name ?? "Professional";
  const imageUrl = professional?.user?.imageUrl ?? null;
  const rating = toNumber(professional?.averageRating);
  const location = joinLocation([
    professional?.address,
    professional?.city,
    professional?.country,
  ]);

  const facts: ProfileFact[] = [];

  if (professional?.email) {
    facts.push({
      label: "Email",
      value: professional.email,
      icon: <MailIcon className="size-3.5" />,
    });
  }

  if (professional?.phone) {
    facts.push({
      label: "Phone",
      value: professional.phone,
      icon: <PhoneIcon className="size-3.5" />,
    });
  }

  if (location) {
    facts.push({
      label: "Location",
      value: location,
      icon: <MapPinIcon className="size-3.5" />,
    });
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Professional</CardTitle>
        <CardDescription>
          The professional you hired for this contract — their profile and
          contact details.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="size-14">
              {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
              <AvatarFallback className="text-base">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-base font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">
                {professional?.professionalTitle ?? "Event professional"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {rating !== null ? (
              <Badge variant="secondary">
                {rating.toFixed(1)}
                <StarIcon className="fill-current" />
              </Badge>
            ) : null}
            {professional?.totalReviews ? (
              <Badge variant="outline">
                {professional.totalReviews} review
                {professional.totalReviews === 1 ? "" : "s"}
              </Badge>
            ) : null}
            {professional?.experienceYears ? (
              <Badge variant="outline">
                {professional.experienceYears} yrs experience
              </Badge>
            ) : null}
          </div>
        </div>

        <ProfileFacts facts={facts} />

        {professional?.bio ? (
          <div className="flex flex-col gap-1 border-t pt-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              About
            </p>
            <p className="text-sm text-muted-foreground">{professional.bio}</p>
          </div>
        ) : null}

        <div className="border-t pt-3">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/professionals/${professionalId}`} />}
          >
            View full profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ContractCounterparty({
  client,
  professional,
  professionalId,
  isProfessional,
}: ContractCounterpartyProps) {
  // A professional only ever sees their own contracts, so their own profile is
  // pointless here — show the client instead. A client sees the professional.
  if (isProfessional) {
    return <ClientCard client={client} />;
  }

  return (
    <ProfessionalCard
      professional={professional}
      professionalId={professionalId}
    />
  );
}
