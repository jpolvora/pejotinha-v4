"use client"

import * as React from "react"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { deleteProject } from "@/actions/projects"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeleteProjectButtonProps {
  id: string
  name: string
}

export function DeleteProjectButton({ id, name }: DeleteProjectButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteProject(id)
      toast.success("Projeto excluído com sucesso!")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao excluir projeto.")
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
        title="Excluir Projeto"
        description="Tem certeza que deseja excluir o projeto"
        itemName={name}
        loading={loading}
      />
    </>
  )
}
