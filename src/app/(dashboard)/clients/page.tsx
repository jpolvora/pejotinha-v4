import { getCustomers, createCustomer, deleteCustomer } from "@/actions/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Trash, Pencil } from "lucide-react";
import Link from "next/link";

export default async function ClientsPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">Manage your freelance customers here.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Acme Corp" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="contact@acmecorp.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Default Hourly Rate (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                  <Input id="hourly_rate" name="hourly_rate" type="number" step="0.01" placeholder="0.00" className="pl-10 font-bold" />
                </div>
                <p className="text-[10px] text-muted-foreground italic">If empty, uses Global Freelancer Rate.</p>
              </div>
              <SubmitButton label="Add Client" />
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Clients</h2>
          {customers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No clients found. Add one to get started.</p>
          ) : (
            <div className="grid gap-4">
              {customers.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.email || "No email provided"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/projects?customer=${c.id}`}>
                        <Button variant="outline" size="sm">
                          View Projects
                        </Button>
                      </Link>
                      <Link href={`/clients/${c.id}/edit`}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteCustomer(c.id);
                      }}>
                        <Button variant="ghost" size="icon" type="submit" className="text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
