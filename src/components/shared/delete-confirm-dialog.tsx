"use client"

import * as React from "react"
import { AlertCircleIcon, Trash2Icon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  itemName?: string
  loading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  loading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader className="items-center sm:items-start">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-sm ring-1 ring-destructive/20 ring-inset ring-offset-0">
            <Trash2Icon className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-balance text-muted-foreground">
            {description} {itemName && <span className="font-bold text-foreground">"{itemName}"</span>}? 
            <br />
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-destructive/80">
              <AlertCircleIcon className="h-3.5 w-3.5" />
              Esta ação não pode ser desfeita.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
            disabled={loading}
            className="w-full sm:w-auto shadow-sm shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {loading ? "Excluindo..." : "Sim, Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
