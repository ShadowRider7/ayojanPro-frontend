"use client";

import { CameraIcon } from "lucide-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { DateText } from "@/components/shared";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUpdateProfileImage } from "@/hooks";
import { enumLabel, MAX_UPLOAD_SIZE_MB, ROLE_OPTIONS } from "@/lib/constants";
import type { UserProfile } from "@/types";
import { initials } from "@/utils";

type ProfileImageCardProps = {
  user: UserProfile;
};

export function ProfileImageCard({ user }: ProfileImageCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageUrlAtPick = useRef<string | null>(user.imageUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutate: uploadImage, isPending } = useUpdateProfileImage();

  const displayUrl = previewUrl ?? user.imageUrl;

  useEffect(() => {
    if (previewUrl && user.imageUrl !== imageUrlAtPick.current) {
      setPreviewUrl(null);
    }
  }, [previewUrl, user.imageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Unsupported file",
        description: "Choose an image file such as JPG, PNG or WebP.",
        type: "error",
      });
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      toast.add({
        title: "Image too large",
        description: `Photos must be ${MAX_UPLOAD_SIZE_MB} MB or smaller.`,
        type: "error",
      });
      return;
    }

    imageUrlAtPick.current = user.imageUrl;
    setPreviewUrl(URL.createObjectURL(file));

    uploadImage(file, {
      onSuccess: () => {
        toast.add({
          title: "Profile photo updated",
          description: "Your new photo is now visible across AyojanPro.",
          type: "success",
        });
      },
      onError: (err) => {
        setPreviewUrl(null);
        toast.add({
          title: "Upload failed",
          description: err.message || "Something went wrong. Please try again",
          type: "error",
        });
      },
    });
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Profile photo</CardTitle>
        <CardDescription>
          JPG, PNG or WebP up to {MAX_UPLOAD_SIZE_MB} MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Avatar size="lg" className="size-20">
          {displayUrl ? <AvatarImage src={displayUrl} alt="" /> : null}
          <AvatarFallback className="text-xl">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="font-medium">{user.name}</p>
            <Badge variant="secondary">
              {enumLabel(ROLE_OPTIONS, user.role) ?? user.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Member since <DateText value={user.createdAt} />
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          aria-label="Profile photo"
          className="sr-only"
          disabled={isPending}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? (
            <>
              <Spinner /> Uploading
            </>
          ) : (
            <>
              <CameraIcon /> Change photo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
