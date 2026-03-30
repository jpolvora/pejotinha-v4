import { getCustomer, updateCustomer } from "@/actions/customers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditClientPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const customer = await getCustomer(params.id);

  if (!customer) {
    notFound();
  }

  const actionWithId = async (formData: FormData) => {
    "use server";
    await updateCustomer(params.id, formData);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-8">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon" className="shrink-0 transition-transform hover:-translate-x-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
          <p className="text-muted-foreground">Update information for {customer.name}.</p>
        </div>
      </div>

      <Card className="shadow-lg border-2 border-border/50 rounded-xl overflow-hidden">
        <CardHeader className="bg-card border-b border-border/50 pb-6">
           <CardTitle className="text-xl">Client Details</CardTitle>
           <CardDescription>Make changes below and save to update the client.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={actionWithId} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={customer.name} 
                required 
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                defaultValue={customer.email || ''} 
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Hourly Rate (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
                <Input 
                  id="hourly_rate" 
                  name="hourly_rate" 
                  type="number" 
                  step="0.01" 
                  defaultValue={customer.hourly_rate ? Number(customer.hourly_rate) : ''}
                  className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md pl-10 font-bold"
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">If empty, uses Global Freelancer Rate.</p>
            </div>
            <div className="pt-4 flex justify-end border-t border-border/50 mt-8 pt-6">
              <SubmitButton label="Save Changes" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
