"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import {
  getSystemSettingsForAdmin,
  updateSystemSettingsInDb,
  testSmtpSocketConnection,
} from "@/services/settings-service";
import {
  validateSystemSettings,
  type SystemSettingsValues,
} from "@/lib/settings-validations";

export interface SaveSettingsResult {
  success: boolean;
  message?: string;
  error?: string;
  versionMismatch?: boolean;
  fieldErrors?: Record<string, string>;
  data?: SystemSettingsValues;
}

/**
 * Server Action za čuvanje podešavanja sistema.
 * Zahteva administratorsku autorizaciju i vrši strogu validaciju svih unosa.
 */
export async function saveSystemSettingsAction(
  data: SystemSettingsValues,
  expectedVersion?: number
): Promise<SaveSettingsResult> {
  // 1. Provera autorizacije
  await requireAdmin();

  // 2. Serverska validacija
  const validation = validateSystemSettings(data);
  if (!validation.valid) {
    return {
      success: false,
      error: "Forma sadrži neispravne podatke. Molimo proverite označena polja.",
      fieldErrors: validation.errors,
    };
  }

  // 3. Eksplicitno mapiranje dozvoljenih polja
  const sanitized: SystemSettingsValues = {
    storeName: String(data.storeName || "").trim(),
    legalName: String(data.legalName || "").trim(),
    pib: String(data.pib || "").trim(),
    registrationNumber: String(data.registrationNumber || "").trim(),
    address: String(data.address || "").trim(),
    city: String(data.city || "").trim(),
    postalCode: String(data.postalCode || "").trim(),
    country: String(data.country || "Srbija").trim(),
    phone: String(data.phone || "").trim(),
    email: String(data.email || "").trim(),
    supportEmail: String(data.supportEmail || "").trim(),
    workingHours: String(data.workingHours || "").trim(),
    bankAccount: String(data.bankAccount || "").trim(),
    currency: String(data.currency || "RSD").trim(),
    locale: String(data.locale || "sr-RS").trim(),
    timezone: String(data.timezone || "Europe/Belgrade").trim(),

    shippingPrice: Math.max(0, Number(data.shippingPrice) || 0),
    freeShippingThreshold:
      data.enableFreeShipping && data.freeShippingThreshold !== null && data.freeShippingThreshold !== undefined
        ? Math.max(0, Number(data.freeShippingThreshold))
        : null,
    enableFreeShipping: Boolean(data.enableFreeShipping),
    allowStorePickup: Boolean(data.allowStorePickup),

    cashOnDeliveryEnabled: Boolean(data.cashOnDeliveryEnabled),
    wireTransferEnabled: Boolean(data.wireTransferEnabled),
    cardPaymentEnabled: false, // Kartično plaćanje je u pripremi

    smtpHost: String(data.smtpHost || "").trim(),
    smtpPort: Math.max(1, Math.min(65535, Number(data.smtpPort) || 587)),
    smtpUser: String(data.smtpUser || "").trim(),
    smtpSecure: data.smtpSecure === "none" || data.smtpSecure === "starttls" ? data.smtpSecure : "tls",
    senderEmail: String(data.senderEmail || "").trim(),
    senderName: String(data.senderName || "").trim(),
    replyToEmail: String(data.replyToEmail || "").trim(),
    newSmtpPassword: data.newSmtpPassword,
    clearSmtpPassword: Boolean(data.clearSmtpPassword),

    googleAnalyticsId: String(data.googleAnalyticsId || "").trim(),
    metaPixelId: String(data.metaPixelId || "").trim(),

    defaultSeoTitle: String(data.defaultSeoTitle || "").trim(),
    defaultSeoDescription: String(data.defaultSeoDescription || "").trim(),
    defaultOgImage: String(data.defaultOgImage || "").trim(),
    siteShareName: String(data.siteShareName || "").trim(),

    maintenanceMode: Boolean(data.maintenanceMode),
    maintenanceNotice: String(data.maintenanceNotice || "").trim(),

    version: Number(data.version) || 1,
  };

  // 4. Upis u bazu sa optimističkim zaključavanjem
  const result = await updateSystemSettingsInDb(sanitized, expectedVersion);

  if (!result.success) {
    return {
      success: false,
      error: result.error || "Došlo je do greške prilikom čuvanja podešavanja.",
      versionMismatch: Boolean(result.versionMismatch),
    };
  }

  const updatedSettings = await getSystemSettingsForAdmin();

  return {
    success: true,
    message: "Podešavanja su uspešno sačuvana.",
    data: updatedSettings,
  };
}

/**
 * Server Action za osvežavanje keša sajta.
 */
export async function revalidateSiteCacheAction() {
  await requireAdmin();

  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/katalog");
    revalidatePath("/brendovi");
    revalidatePath("/admin/settings");
    revalidatePath("/korpa");
    revalidatePath("/placanje");
    revalidatePath("/kontakt");
    revalidatePath("/isporuka");

    return {
      success: true,
      message: "Keš aplikacije i javnih ruta je uspešno osvežen.",
    };
  } catch (error) {
    console.error("Greška pri osvežavanju keša:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Neuspešno osvežavanje keša.",
    };
  }
}

/**
 * Server Action za dijagnostiku i testiranje SMTP mrežne veze.
 */
export async function testSmtpConnectionAction(host: string, port: number) {
  await requireAdmin();
  return testSmtpSocketConnection(host, port);
}

