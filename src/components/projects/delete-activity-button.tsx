"use client"

import * as React from "react"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { deleteActivity } from "@/actions/activities"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeleteActivityButtonProps {
  id: string
  projectId: string
  description: string
}

export function DeleteActivityButton({ id, projectId, description }: DeleteActivityButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteActivity(id, projectId)
      toast.success("Atividade excluída com sucesso!")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao excluir atividade.")
      console.error(error)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
      >
        <Trash className="h-4 w-4" />
      </Button>
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        title="Excluir Atividade"
        description="Tem certeza que deseja excluir esta atividade"
        itemName={description.length > 30 ? description.substring(0, 30) + "..." : description}
        loading={loading}
      />
    </>
  )
}
