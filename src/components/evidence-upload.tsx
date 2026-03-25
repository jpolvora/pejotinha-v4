"use client";

import { useTransition } from "react";
import { uploadEvidence } from "@/actions/activities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

export function EvidenceUpload({ activityId, projectId }: { activityId: string, projectId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleUpload = async (formData: FormData) => {
    formData.append("activity_id", activityId);
    formData.append("project_id", projectId);
    
    startTransition(async () => {
      try {
        await uploadEvidence(formData);
      } catch (e) {
        console.error("Upload failed", e);
        alert("Failed to upload evidence.");
      }
    });
  };

  return (
    <form action={handleUpload} className="flex items-center gap-2 mt-4 pt-4 border-t">
      <Input 
        type="file" 
        name="file" 
        required 
        disabled={isPending}
        className="max-w-[250px] cursor-pointer" 
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Uploading..." : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
      </Button>
    </form>
  );
}
