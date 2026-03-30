import { acceptInvitation } from "@/actions/invitations";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InvitePage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const invitation = await prisma.invitation.findUnique({
    where: { token: params.token },
    include: { project: { include: { freelancer: true } } }
  });

  if (!invitation) return notFound();

  const isExpired = new Date() > invitation.expiresAt;
  const isAccepted = invitation.status === "accepted";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full shadow-lg border-2">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Convite de Projeto</CardTitle>
          <CardDescription>
            Você foi convidado para colaborar no projeto <strong>{invitation.project.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="p-4 bg-muted rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground mb-1">Freelancer:</p>
            <p className="font-semibold text-lg">{invitation.project.freelancer.fullName || invitation.project.freelancer.email}</p>
          </div>
          
          {isExpired && (
            <div className="flex items-center justify-center gap-2 text-destructive font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>Este convite expirou.</span>
            </div>
          )}

          {isAccepted && (
            <div className="flex flex-col items-center gap-2 text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Você já aceitou este convite.</span>
              <Link href={`/projects/${invitation.projectId}`}>
                <Button variant="link">Ir para o Projeto</Button>
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!isExpired && !isAccepted && (
            <form action={async () => {
              "use server";
              await acceptInvitation(params.token);
            }} className="w-full">
              <Button type="submit" className="w-full text-lg h-12">
                Aceitar Convite e Entrar
              </Button>
            </form>
          )}
          {(isExpired || isAccepted) && (
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">Voltar para Dashboard</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
