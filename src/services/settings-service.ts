import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import net from "node:net";
import dns from "node:dns";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { SystemSettingsValues } from "@/lib/settings-validations";

export type PublicSystemSettings = SystemSettingsValues;

const CANONICAL_ID = "canonical";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ALLOWED_SMTP_PORTS = [25, 465, 587, 2525];

function getEncryptionKey(): Buffer {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Kritična bezbednosna konfiguracija: Varijable SETTINGS_ENCRYPTION_KEY ili ADMIN_SESSION_SECRET moraju biti podešene u produkciji."
      );
    }
    // Razvojno okruženje
    return createHash("sha256").update("aqua-still-dev-local-secret-key-2026").digest();
  }
  return createHash("sha256").update(secret).digest();
}

function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  try {
    const [ivHex, tagHex, encryptedHex] = ciphertext.split(":");
    if (!ivHex || !tagHex || !encryptedHex) return null;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const key = getEncryptionKey();
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final("utf8");
  } catch {
    return null;
  }
}

/**
 * Podrazumevane vrednosti kada baza još uvek nema zapisanih podešavanja.
 */
export const DEFAULT_SETTINGS: SystemSettingsValues = {
  storeName: "Aqua Still Shop Zlatibor",
  legalName: "Aqua Still Zlatibor d.o.o.",
  pib: "112233445",
  registrationNumber: "21345678",
  address: "Magistralni put bb",
  city: "Zlatibor",
  postalCode: "31315",
  country: "Srbija",
  phone: "+381 31 123 456",
  email: "info@aquastill-zlatibor.rs",
  supportEmail: "podrska@aquastill-zlatibor.rs",
  workingHours: "Pon - Sub: 07:00 - 18:00 · Nedeljom zatvoreno",
  bankAccount: "160-0000000123456-78",
  currency: "RSD",
  locale: "sr-RS",
  timezone: "Europe/Belgrade",

  // Dostava
  shippingPrice: 500,
  freeShippingThreshold: 5000,
  enableFreeShipping: true,
  allowStorePickup: true,

  // Plaćanje
  cashOnDeliveryEnabled: true,
  wireTransferEnabled: true,
  cardPaymentEnabled: false,

  // E-pošta i SMTP
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpSecure: "tls",
  senderEmail: "noreply@aquastill-zlatibor.rs",
  senderName: "Aqua Still Shop Zlatibor",
  replyToEmail: "info@aquastill-zlatibor.rs",
  hasSmtpPassword: false,

  // Integracije
  googleAnalyticsId: "",
  metaPixelId: "",

  // SEO
  defaultSeoTitle: "Aqua Still Zlatibor | Alati, vodovodni materijal i kupatilska oprema",
  defaultSeoDescription: "Prodavnica profesionalnih alata, vodovoda, opreme za kupatila i navodnjavanje na Zlatiboru. Brza dostava i preuzimanje u radnji.",
  defaultOgImage: "/images/hero-1.webp",
  siteShareName: "Aqua Still Shop",

  // Održavanje
  maintenanceMode: false,
  maintenanceNotice: "U toku su planirani radovi na održavanju sistema. Vraćamo se uskoro!",

  version: 1,
};

/**
 * Javna bezbedna podešavanja za webshop (korpa, checkout, footer, kontakt).
 * Otporna na greške baze podataka — ako baza privremeno nije dostupna, vraća DEFAULT_SETTINGS.
 */
export async function getSystemSettings(): Promise<SystemSettingsValues> {
  if (!process.env.DATABASE_URL) return DEFAULT_SETTINGS;

  try {
    const row = await db.systemSettings.findUnique({
      where: { id: CANONICAL_ID },
    });

    if (!row) return DEFAULT_SETTINGS;

    return {
      storeName: row.storeName || DEFAULT_SETTINGS.storeName,
      legalName: row.legalName || DEFAULT_SETTINGS.legalName,
      pib: row.pib || DEFAULT_SETTINGS.pib,
      registrationNumber: row.registrationNumber || DEFAULT_SETTINGS.registrationNumber,
      address: row.address || DEFAULT_SETTINGS.address,
      city: row.city || DEFAULT_SETTINGS.city,
      postalCode: row.postalCode || DEFAULT_SETTINGS.postalCode,
      country: row.country || DEFAULT_SETTINGS.country,
      phone: row.phone || DEFAULT_SETTINGS.phone,
      email: row.email || DEFAULT_SETTINGS.email,
      supportEmail: row.supportEmail || DEFAULT_SETTINGS.supportEmail,
      workingHours: row.workingHours || DEFAULT_SETTINGS.workingHours,
      bankAccount: row.bankAccount || DEFAULT_SETTINGS.bankAccount,
      currency: row.currency || DEFAULT_SETTINGS.currency,
      locale: row.locale || DEFAULT_SETTINGS.locale,
      timezone: row.timezone || DEFAULT_SETTINGS.timezone,

      shippingPrice: Number(row.shippingPrice ?? DEFAULT_SETTINGS.shippingPrice),
      freeShippingThreshold: row.freeShippingThreshold !== null ? Number(row.freeShippingThreshold) : null,
      enableFreeShipping: row.enableFreeShipping,
      allowStorePickup: row.allowStorePickup,

      cashOnDeliveryEnabled: row.cashOnDeliveryEnabled,
      wireTransferEnabled: row.wireTransferEnabled,
      cardPaymentEnabled: row.cardPaymentEnabled,

      smtpHost: row.smtpHost || "",
      smtpPort: row.smtpPort ?? 587,
      smtpUser: row.smtpUser || "",
      smtpSecure: (row.smtpSecure as "tls" | "starttls" | "none") || "tls",
      senderEmail: row.senderEmail || "",
      senderName: row.senderName || "",
      replyToEmail: row.replyToEmail || "",
      hasSmtpPassword: Boolean(row.smtpPasswordEncrypted || process.env.SMTP_PASSWORD),

      googleAnalyticsId: row.googleAnalyticsId || "",
      metaPixelId: row.metaPixelId || "",

      defaultSeoTitle: row.defaultSeoTitle || DEFAULT_SETTINGS.defaultSeoTitle,
      defaultSeoDescription: row.defaultSeoDescription || DEFAULT_SETTINGS.defaultSeoDescription,
      defaultOgImage: row.defaultOgImage || DEFAULT_SETTINGS.defaultOgImage,
      siteShareName: row.siteShareName || DEFAULT_SETTINGS.siteShareName,

      maintenanceMode: row.maintenanceMode,
      maintenanceNotice: row.maintenanceNotice || DEFAULT_SETTINGS.maintenanceNotice,

      version: row.version,
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (error) {
    console.warn("Greška pri učitavanju sistemskih podešavanja:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Učitavanje kompletnih podešavanja za administratorski panel.
 * Obezbeđuje kreiranje kanonskog zapisa ukoliko još uvek ne postoji.
 */
export async function getSystemSettingsForAdmin(): Promise<SystemSettingsValues> {
  if (!process.env.DATABASE_URL) return DEFAULT_SETTINGS;

  try {
    const row = await db.systemSettings.upsert({
      where: { id: CANONICAL_ID },
      create: {
        id: CANONICAL_ID,
        storeName: DEFAULT_SETTINGS.storeName,
        legalName: DEFAULT_SETTINGS.legalName,
        pib: DEFAULT_SETTINGS.pib,
        registrationNumber: DEFAULT_SETTINGS.registrationNumber,
        address: DEFAULT_SETTINGS.address,
        city: DEFAULT_SETTINGS.city,
        postalCode: DEFAULT_SETTINGS.postalCode,
        country: DEFAULT_SETTINGS.country,
        phone: DEFAULT_SETTINGS.phone,
        email: DEFAULT_SETTINGS.email,
        supportEmail: DEFAULT_SETTINGS.supportEmail,
        workingHours: DEFAULT_SETTINGS.workingHours,
        bankAccount: DEFAULT_SETTINGS.bankAccount,
        currency: DEFAULT_SETTINGS.currency,
        locale: DEFAULT_SETTINGS.locale,
        timezone: DEFAULT_SETTINGS.timezone,
        shippingPrice: new Prisma.Decimal(DEFAULT_SETTINGS.shippingPrice),
        freeShippingThreshold: DEFAULT_SETTINGS.freeShippingThreshold ? new Prisma.Decimal(DEFAULT_SETTINGS.freeShippingThreshold) : null,
        enableFreeShipping: DEFAULT_SETTINGS.enableFreeShipping,
        allowStorePickup: DEFAULT_SETTINGS.allowStorePickup,
        cashOnDeliveryEnabled: DEFAULT_SETTINGS.cashOnDeliveryEnabled,
        wireTransferEnabled: DEFAULT_SETTINGS.wireTransferEnabled,
        cardPaymentEnabled: DEFAULT_SETTINGS.cardPaymentEnabled,
        smtpHost: DEFAULT_SETTINGS.smtpHost,
        smtpPort: DEFAULT_SETTINGS.smtpPort,
        smtpUser: DEFAULT_SETTINGS.smtpUser,
        smtpSecure: DEFAULT_SETTINGS.smtpSecure,
        senderEmail: DEFAULT_SETTINGS.senderEmail,
        senderName: DEFAULT_SETTINGS.senderName,
        replyToEmail: DEFAULT_SETTINGS.replyToEmail,
        googleAnalyticsId: DEFAULT_SETTINGS.googleAnalyticsId,
        metaPixelId: DEFAULT_SETTINGS.metaPixelId,
        defaultSeoTitle: DEFAULT_SETTINGS.defaultSeoTitle,
        defaultSeoDescription: DEFAULT_SETTINGS.defaultSeoDescription,
        defaultOgImage: DEFAULT_SETTINGS.defaultOgImage,
        siteShareName: DEFAULT_SETTINGS.siteShareName,
        maintenanceMode: DEFAULT_SETTINGS.maintenanceMode,
        maintenanceNotice: DEFAULT_SETTINGS.maintenanceNotice,
        version: 1,
      },
      update: {},
    });

    return {
      storeName: row.storeName,
      legalName: row.legalName || "",
      pib: row.pib || "",
      registrationNumber: row.registrationNumber || "",
      address: row.address || "",
      city: row.city || "",
      postalCode: row.postalCode || "",
      country: row.country,
      phone: row.phone || "",
      email: row.email || "",
      supportEmail: row.supportEmail || "",
      workingHours: row.workingHours || "",
      bankAccount: row.bankAccount || "",
      currency: row.currency,
      locale: row.locale,
      timezone: row.timezone,

      shippingPrice: Number(row.shippingPrice),
      freeShippingThreshold: row.freeShippingThreshold !== null ? Number(row.freeShippingThreshold) : null,
      enableFreeShipping: row.enableFreeShipping,
      allowStorePickup: row.allowStorePickup,

      cashOnDeliveryEnabled: row.cashOnDeliveryEnabled,
      wireTransferEnabled: row.wireTransferEnabled,
      cardPaymentEnabled: row.cardPaymentEnabled,

      smtpHost: row.smtpHost || "",
      smtpPort: row.smtpPort ?? 587,
      smtpUser: row.smtpUser || "",
      smtpSecure: (row.smtpSecure as "tls" | "starttls" | "none") || "tls",
      senderEmail: row.senderEmail || "",
      senderName: row.senderName || "",
      replyToEmail: row.replyToEmail || "",
      hasSmtpPassword: Boolean(row.smtpPasswordEncrypted || process.env.SMTP_PASSWORD),

      googleAnalyticsId: row.googleAnalyticsId || "",
      metaPixelId: row.metaPixelId || "",

      defaultSeoTitle: row.defaultSeoTitle || "",
      defaultSeoDescription: row.defaultSeoDescription || "",
      defaultOgImage: row.defaultOgImage || "",
      siteShareName: row.siteShareName || "",

      maintenanceMode: row.maintenanceMode,
      maintenanceNotice: row.maintenanceNotice || "",

      version: row.version,
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Greška pri dohvatanju podešavanja za admina:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Ažuriranje podešavanja sa optimističkim zaključavanjem (provera verzije).
 */
export async function updateSystemSettingsInDb(
  data: SystemSettingsValues,
  expectedVersion?: number
): Promise<{ success: boolean; error?: string; newVersion?: number; versionMismatch?: boolean }> {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: "Baza podataka nije dostupna." };
  }

  try {
    const existing = await db.systemSettings.findUnique({
      where: { id: CANONICAL_ID },
      select: { version: true, smtpPasswordEncrypted: true },
    });

    if (existing && typeof expectedVersion === "number" && existing.version !== expectedVersion) {
      return {
        success: false,
        versionMismatch: true,
        error: "Podešavanja su u međuvremenu ažurirana od strane drugog administratora. Molimo osvežite stranicu kako biste videli najnovije podatke pre čuvanja novih izmena.",
      };
    }

    // Bezbedno rukovanje SMTP lozinkom
    let smtpPasswordEncrypted = existing?.smtpPasswordEncrypted ?? null;
    if (data.clearSmtpPassword) {
      smtpPasswordEncrypted = null;
    } else if (data.newSmtpPassword && data.newSmtpPassword.trim() !== "") {
      smtpPasswordEncrypted = encryptSecret(data.newSmtpPassword.trim());
    }

    const updated = await db.systemSettings.upsert({
      where: { id: CANONICAL_ID },
      create: {
        id: CANONICAL_ID,
        storeName: data.storeName.trim(),
        legalName: data.legalName?.trim() || null,
        pib: data.pib?.trim() || null,
        registrationNumber: data.registrationNumber?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        postalCode: data.postalCode?.trim() || null,
        country: data.country?.trim() || "Srbija",
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        supportEmail: data.supportEmail?.trim() || null,
        workingHours: data.workingHours?.trim() || null,
        bankAccount: data.bankAccount?.trim() || null,
        currency: data.currency?.trim() || "RSD",
        locale: data.locale?.trim() || "sr-RS",
        timezone: data.timezone?.trim() || "Europe/Belgrade",

        shippingPrice: new Prisma.Decimal(data.shippingPrice),
        freeShippingThreshold:
          data.enableFreeShipping && data.freeShippingThreshold !== null && data.freeShippingThreshold !== undefined
            ? new Prisma.Decimal(data.freeShippingThreshold)
            : null,
        enableFreeShipping: data.enableFreeShipping,
        allowStorePickup: data.allowStorePickup,

        cashOnDeliveryEnabled: data.cashOnDeliveryEnabled,
        wireTransferEnabled: data.wireTransferEnabled,
        cardPaymentEnabled: data.cardPaymentEnabled,

        smtpHost: data.smtpHost?.trim() || null,
        smtpPort: Number(data.smtpPort) || 587,
        smtpUser: data.smtpUser?.trim() || null,
        smtpPasswordEncrypted,
        smtpSecure: data.smtpSecure || "tls",
        senderEmail: data.senderEmail?.trim() || null,
        senderName: data.senderName?.trim() || null,
        replyToEmail: data.replyToEmail?.trim() || null,

        googleAnalyticsId: data.googleAnalyticsId?.trim() || null,
        metaPixelId: data.metaPixelId?.trim() || null,

        defaultSeoTitle: data.defaultSeoTitle?.trim() || null,
        defaultSeoDescription: data.defaultSeoDescription?.trim() || null,
        defaultOgImage: data.defaultOgImage?.trim() || null,
        siteShareName: data.siteShareName?.trim() || null,

        maintenanceMode: data.maintenanceMode,
        maintenanceNotice: data.maintenanceNotice?.trim() || null,

        version: 1,
      },
      update: {
        storeName: data.storeName.trim(),
        legalName: data.legalName?.trim() || null,
        pib: data.pib?.trim() || null,
        registrationNumber: data.registrationNumber?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        postalCode: data.postalCode?.trim() || null,
        country: data.country?.trim() || "Srbija",
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        supportEmail: data.supportEmail?.trim() || null,
        workingHours: data.workingHours?.trim() || null,
        bankAccount: data.bankAccount?.trim() || null,
        currency: data.currency?.trim() || "RSD",
        locale: data.locale?.trim() || "sr-RS",
        timezone: data.timezone?.trim() || "Europe/Belgrade",

        shippingPrice: new Prisma.Decimal(data.shippingPrice),
        freeShippingThreshold:
          data.enableFreeShipping && data.freeShippingThreshold !== null && data.freeShippingThreshold !== undefined
            ? new Prisma.Decimal(data.freeShippingThreshold)
            : null,
        enableFreeShipping: data.enableFreeShipping,
        allowStorePickup: data.allowStorePickup,

        cashOnDeliveryEnabled: data.cashOnDeliveryEnabled,
        wireTransferEnabled: data.wireTransferEnabled,
        cardPaymentEnabled: data.cardPaymentEnabled,

        smtpHost: data.smtpHost?.trim() || null,
        smtpPort: Number(data.smtpPort) || 587,
        smtpUser: data.smtpUser?.trim() || null,
        smtpPasswordEncrypted,
        smtpSecure: data.smtpSecure || "tls",
        senderEmail: data.senderEmail?.trim() || null,
        senderName: data.senderName?.trim() || null,
        replyToEmail: data.replyToEmail?.trim() || null,

        googleAnalyticsId: data.googleAnalyticsId?.trim() || null,
        metaPixelId: data.metaPixelId?.trim() || null,

        defaultSeoTitle: data.defaultSeoTitle?.trim() || null,
        defaultSeoDescription: data.defaultSeoDescription?.trim() || null,
        defaultOgImage: data.defaultOgImage?.trim() || null,
        siteShareName: data.siteShareName?.trim() || null,

        maintenanceMode: data.maintenanceMode,
        maintenanceNotice: data.maintenanceNotice?.trim() || null,

        version: { increment: 1 },
      },
    });

    // Invalidacija relevantnih keševa
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/korpa");
    revalidatePath("/placanje");
    revalidatePath("/kontakt");
    revalidatePath("/isporuka");

    return { success: true, newVersion: updated.version };
  } catch (error) {
    console.error("Greška pri čuvanju sistemskih podešavanja:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Došlo je do greške prilikom čuvanja podešavanja.",
    };
  }
}

/**
 * Provera da li IP adresa pripada lokalnim, privatnim ili cloud-metadata opsezima (SSRF zaštita).
 */
function isPrivateOrReservedIp(ip: string): boolean {
  const cleanIp = ip.trim().toLowerCase();

  // IPv4 Loopback & unspecified
  if (cleanIp === "0.0.0.0" || cleanIp.startsWith("127.")) return true;

  // RFC 1918 privatni opsezi
  if (cleanIp.startsWith("10.")) return true;
  if (cleanIp.startsWith("192.168.")) return true;

  // Link-local / Cloud metadata servis (AWS, GCP, Azure, OpenStack 169.254.169.254)
  if (cleanIp.startsWith("169.254.")) return true;

  // 172.16.0.0/12 (172.16.0.0 – 172.31.255.255)
  const parts = cleanIp.split(".").map(Number);
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }

  // IPv6 Loopback, unspecified i privatni opsezi
  if (
    cleanIp === "::1" ||
    cleanIp === "::" ||
    cleanIp.startsWith("fe80:") ||
    cleanIp.startsWith("fc") ||
    cleanIp.startsWith("fd")
  ) {
    return true;
  }

  return false;
}

/**
 * Bezbedno testiranje mrežne konekcije ka SMTP serveru.
 * Uključuje strogu SSRF zaštitu, proveru portova i validaciju razrešenih IP adresa.
 */
export async function testSmtpSocketConnection(
  host: string,
  port: number
): Promise<{ success: boolean; message: string }> {
  if (!host || typeof host !== "string" || host.trim() === "") {
    return { success: false, message: "SMTP host nije podešen." };
  }

  const trimmedHost = host.trim().toLowerCase();

  // 1. Provera porta: dozvoljeni su samo legitimni SMTP portovi
  if (!ALLOWED_SMTP_PORTS.includes(port)) {
    return {
      success: false,
      message: `Port ${port} nije dozvoljen za SMTP testiranje. Dozvoljeni portovi su: ${ALLOWED_SMTP_PORTS.join(", ")}.`,
    };
  }

  // 2. Zabrana očiglednih internih imena domena
  if (
    trimmedHost === "localhost" ||
    trimmedHost.endsWith(".localhost") ||
    trimmedHost.endsWith(".local") ||
    trimmedHost.endsWith(".internal") ||
    trimmedHost.endsWith(".lan")
  ) {
    return {
      success: false,
      message: "Povezivanje na lokalne ili interne hostove nije dozvoljeno (SSRF zaštita).",
    };
  }

  // 3. DNS razrešavanje i filtriranje privatnih IP adresa pre otvaranja socket-a
  let resolvedIps: string[] = [];
  try {
    const lookupResults = await dns.promises.lookup(trimmedHost, { all: true });
    resolvedIps = lookupResults.map((r) => r.address);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Proverite ispravnost domena.";
    return {
      success: false,
      message: `DNS razrešavanje nije uspelo za „${trimmedHost}“: ${errMsg}`,
    };
  }

  if (resolvedIps.length === 0) {
    return { success: false, message: "Host nije razrešen ni na jednu IP adresu." };
  }

  // Proveri svaku razrešenu IP adresu
  for (const ip of resolvedIps) {
    if (isPrivateOrReservedIp(ip)) {
      return {
        success: false,
        message: `Host „${trimmedHost}“ je razrešen na zaštićenu ili privatnu adresu (${ip}). Konekcija je blokirana iz bezbednosnih razloga.`,
      };
    }
  }

  const targetIp = resolvedIps[0];

  // 4. Uspostavljanje TCP veze ka prvoj bezbednoj razrešenoj IP adresi
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let hasResolved = false;

    const timeout = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve({
          success: false,
          message: `Vreme za povezivanje na ${trimmedHost}:${port} je isteklo (timeout 5s). Proverite dostupnost servera.`,
        });
      }
    }, 5000);

    socket.connect(port, targetIp, () => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeout);
        socket.destroy();
        resolve({
          success: true,
          message: `Uspešno uspostavljena mrežna TCP veza sa SMTP serverom ${trimmedHost} (${targetIp}:${port}).`,
        });
      }
    });

    socket.on("error", (err) => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeout);
        socket.destroy();
        resolve({
          success: false,
          message: `Neuspela veza sa ${trimmedHost}:${port}: ${err.message}`,
        });
      }
    });
  });
}

