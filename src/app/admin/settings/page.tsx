import React from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSystemSettingsForAdmin } from "@/services/settings-service";
import SettingsClient from "@/components/admin/settings/SettingsClient";

export const metadata = {
  title: "Podešavanja sistema | Aqua Still Shop Zlatibor",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // 1. Autorizacija: pristup dozvoljen isključivo administratorima
  await requireAdmin();

  // 2. Preuzimanje kanonskih podešavanja za admin panel
  const settings = await getSystemSettingsForAdmin();

  return <SettingsClient initialSettings={settings} />;
}
