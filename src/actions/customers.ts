"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionWrapper, ActionResponse } from "@/lib/action-utils";

export async function getCustomers(): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    return await prisma.customer.findMany({
      where: { freelancerId: user.id },
      orderBy: { createdAt: 'desc' }
    });
  });
  return result.success ? result.data! : [];
}

export async function getCustomer(id: string): Promise<any | null> {
  const result = await actionWrapper(async (user) => {
    return await prisma.customer.findUnique({
      where: { 
        id,
        freelancerId: user.id 
      }
    });
  });
  return result.success ? result.data! : null;
}

export async function createCustomer(formData: FormData): Promise<any> {
  return await actionWrapper(async (user) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const hourlyRate = parseFloat(formData.get("hourly_rate") as string) || 0;

    if (!name) throw new Error("Name is required");

    const customer = await prisma.customer.create({
      data: { 
        freelancerId: user.id, 
        name, 
        email,
        hourlyRate
      }
    });

    revalidatePath("/clients");
    return customer;
  });
}

export async function updateCustomer(id: string, formData: FormData): Promise<any> {
  const result = await actionWrapper(async (user) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const hourlyRate = parseFloat(formData.get("hourly_rate") as string) || 0;

    if (!name) throw new Error("Name is required");

    const customer = await prisma.customer.update({
      where: { 
        id,
        freelancerId: user.id
      },
      data: { name, email, hourlyRate }
    });

    revalidatePath("/clients");
    return customer;
  });

  if (result.success) {
    redirect("/clients");
  }
  return result;
}

export async function deleteCustomer(id: string): Promise<any> {
  return await actionWrapper(async (user) => {
    await prisma.customer.delete({
      where: { 
        id,
        freelancerId: user.id
      }
    });
    // Wait, let me double check the field name in prisma schema
    // It's "freelancerId" as per line 41 of schema.prisma
    
    revalidatePath("/clients");
  });
}
