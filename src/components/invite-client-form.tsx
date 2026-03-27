"use client";

import { useState } from "react";
import { createInvitation } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { client_access_role } from "@prisma/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function InviteClientForm({ projectId }: { projectId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<client_access_role>("owner");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const result = await createInvitation(projectId, email, role);
      if (result && result.success) {
        const data = result.data as any;
        toast.success(data.message);
        if (data.inviteUrl) {
           console.log("Invite URL:", data.inviteUrl);
        }
        setEmail("");
      } else {
        toast.error(result?.error || "Erro ao enviar convite");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-email">Email do Cliente</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="client-email"
            type="email"
            placeholder="cliente@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="flex-1"
          />
          <Select 
            value={role} 
            onValueChange={(val: any) => setRole(val)}
            disabled={loading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner (Full)</SelectItem>
              <SelectItem value="supervisor">Supervisor (View)</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading} className="shrink-0 bg-primary/90">
            {loading ? "Enviando..." : (
              <>
                <Send className="mr-2 h-4 w-4" /> Convidar
              </>
            )}
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Se o usuário já existe na plataforma, ele será vinculado imediatamente. 
        Caso contrário, ele receberá um link de convite.
      </p>
    </form>
  );
}
