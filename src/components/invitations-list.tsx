"use client";

import { useState, useEffect } from "react";
import { getInvitations } from "@/actions/invitations";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, XCircle } from "lucide-react";

export function InvitationsList({ projectId }: { projectId: string }) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvitations() {
      const res = await getInvitations(projectId);
      setInvitations(res);
      setLoading(false);
    }
    loadInvitations();
  }, [projectId]);

  if (loading) return <div className="text-xs text-muted-foreground">Carregando convites...</div>;
  if (invitations.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Convites Recentes</h3>
      <div className="space-y-2">
        {invitations.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/20 text-xs">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium truncate max-w-[150px]" title={inv.email}>{inv.email}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{inv.role}</span>
            </div>
            <div className="flex gap-2 shrink-0">
              {inv.status === "pending" && (
                <Badge variant="outline" className="text-[9px] h-4 bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="mr-1 h-2 w-2" /> PENDENTE
                </Badge>
              )}
              {inv.status === "accepted" && (
                <Badge variant="outline" className="text-[9px] h-4 bg-green-50 text-green-700 border-green-200">
                  <Check className="mr-1 h-2 w-2" /> ACEITO
                </Badge>
              )}
              {inv.status === "expired" && (
                <Badge variant="outline" className="text-[9px] h-4 bg-red-50 text-red-700 border-red-200">
                  <XCircle className="mr-1 h-2 w-2" /> EXPIRADO
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
