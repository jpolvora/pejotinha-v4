"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Loader2 } from "lucide-react";
import { createPersonalEvent } from "@/actions/personal_events";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export function PersonalEventModal() {
  const t = useTranslations('Calendar');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await createPersonalEvent(formData);
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="gap-2 shadow-sm rounded-full px-6">
            <CalendarPlus className="w-4 h-4" />
            {t('logEvent')}
          </Button>
        }
      />
      <SheetContent className="sm:max-w-md overflow-y-auto w-full">
        <SheetHeader className="px-4 pt-6 sm:px-6">
          <SheetTitle className="text-2xl">{t('logEvent')}</SheetTitle>
          <SheetDescription className="text-base">
            {t('description')}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={onSubmit} className="space-y-6 mt-2 px-4 pb-6 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">{t('eventTitle')}</Label>
            <Input id="title" name="title" required placeholder={t('eventPlaceholder')} className="bg-muted/30" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">{t('eventDescription')}</Label>
            <Input id="description" name="description" placeholder={t('descriptionPlaceholder')} className="bg-muted/30" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-foreground">{t('startTime')}</Label>
              <Input id="start_time" name="start_time" type="datetime-local" className="bg-muted/30" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-foreground">{t('endTime')}</Label>
              <Input id="end_time" name="end_time" type="datetime-local" className="bg-muted/30" required />
            </div>
          </div>

          <div className="space-y-3 p-5 border rounded-xl bg-card shadow-sm mt-4">
            <Label htmlFor="proof_file" className="text-foreground font-semibold">{t('attachProof')}</Label>
            <p className="text-sm text-muted-foreground mb-3">{t('proofDescription')}</p>
            <Input id="proof_file" name="proof_file" type="file" accept="image/*,.pdf" className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
          </div>

          <div className="pt-4 border-t">
            <Button type="submit" className="w-full text-md py-6 rounded-full" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {loading ? t('saving') : t('saveEvent')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
