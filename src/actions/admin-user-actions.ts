"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const ROLES = ["admin", "warehouse", "editor"] as const;

export async function getAdminUsers() {
  await requireAdmin();
  return db.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id:true,name:true,email:true,role:true,isActive:true,createdAt:true },
  });
}

export async function createAdminUser(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "warehouse");

  if (!name || !email || !password || !ROLES.includes(role as (typeof ROLES)[number])) throw new Error("Popunite sva obavezna polja.");
  if (password.length < 8) throw new Error("Lozinka mora imati najmanje 8 karaktera.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Unesite ispravan e-mail.");

  const existing = await db.user.findUnique({ where:{email}, select:{id:true} });
  if (existing) throw new Error("Korisnik sa ovim e-mailom već postoji.");

  await db.user.create({
    data: { name, email, password: await hash(password, 12), role, isActive:true },
  });

  revalidatePath("/admin/users");
}

export async function updateAdminUser(userId: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "warehouse");
  const password = String(formData.get("password") ?? "");
  const isActive = formData.get("isActive") === "on";

  if (!userId || !name || !ROLES.includes(role as (typeof ROLES)[number])) throw new Error("Neispravni podaci.");
  if (password && password.length < 8) throw new Error("Nova lozinka mora imati najmanje 8 karaktera.");

  const data: {name:string;role:string;isActive:boolean;password?:string} = { name, role, isActive };
  if (password) data.password = await hash(password, 12);

  await db.user.update({ where:{id:userId}, data });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function deactivateAdminUser(userId: string) {
  await requireAdmin();
  const current = await requireAdmin();
  if (current.id === userId) throw new Error("Ne možete deaktivirati sopstveni nalog.");
  await db.user.update({ where:{id:userId}, data:{isActive:false} });
  revalidatePath("/admin/users");
}
