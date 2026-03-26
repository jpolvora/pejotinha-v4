"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProjectFormFieldsProps {
  initialName?: string;
  initialSlug?: string;
  nameLabel?: string;
  slugLabel?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export function ProjectFormFields({
  initialName = "",
  initialSlug = "",
  nameLabel = "Project Name",
  slugLabel = "Project Slug (for integrations)",
  className = "space-y-4",
  inputClassName = "h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md",
  labelClassName = "text-xs font-bold uppercase tracking-wider text-muted-foreground",
}: ProjectFormFieldsProps) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  
  // If we have an existing slug that differs from the default slugification,
  // we assume it was manual or we want to preserve it.
  const [isSlugManual, setIsSlugManual] = useState(
    initialSlug !== "" && initialSlug !== slugify(initialName)
  );

  useEffect(() => {
    if (!isSlugManual && name) {
      setSlug(slugify(name));
    }
  }, [name, isSlugManual]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManual(true);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className={labelClassName}>
          {nameLabel}
        </Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Website Redesign"
          required
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className={labelClassName}>
          {slugLabel}
        </Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={handleSlugChange}
          placeholder="e.g. acme-corp"
          required
          className={inputClassName}
        />
        {slugLabel && (
          <p className="text-[10px] text-muted-foreground italic">
            Used in branch names: client/{slug || "slug"}/feature
          </p>
        )}
      </div>
    </>
  );
}
