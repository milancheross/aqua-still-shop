/**
 * Validacija i tipovi za modul Podešavanja sistema (Aqua Still Shop Zlatibor).
 * Svi nazivi grešaka i opisi su na srpskom jeziku (ekavica).
 */

export interface SystemSettingsValues {
  // Osnovni podaci
  storeName: string;
  legalName: string;
  pib: string;
  registrationNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  supportEmail: string;
  workingHours: string;
  bankAccount: string;
  currency: string;
  locale: string;
  timezone: string;

  // Dostava
  shippingPrice: number;
  freeShippingThreshold: number | null;
  enableFreeShipping: boolean;
  allowStorePickup: boolean;

  // Plaćanje
  cashOnDeliveryEnabled: boolean;
  wireTransferEnabled: boolean;
  cardPaymentEnabled: boolean;

  // E-pošta i SMTP
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSecure: "tls" | "starttls" | "none";
  senderEmail: string;
  senderName: string;
  replyToEmail: string;
  hasSmtpPassword?: boolean;
  newSmtpPassword?: string;
  clearSmtpPassword?: boolean;

  // Integracije
  googleAnalyticsId: string;
  metaPixelId: string;

  // SEO
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage: string;
  siteShareName: string;

  // Održavanje
  maintenanceMode: boolean;
  maintenanceNotice: string;

  // Verzija za optimističko zaključavanje
  version: number;
  updatedAt?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateSystemSettings(data: Partial<SystemSettingsValues>): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Osnovni podaci
  if (!data.storeName || data.storeName.trim().length < 2) {
    errors.storeName = "Naziv prodavnice je obavezan (minimalno 2 karaktera).";
  }

  if (data.email && data.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = "Unesite ispravnu e-mail adresu.";
    }
  }

  if (data.supportEmail && data.supportEmail.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.supportEmail.trim())) {
      errors.supportEmail = "Unesite ispravnu e-mail adresu za podršku.";
    }
  }

  // 2. Dostava
  if (data.shippingPrice !== undefined && data.shippingPrice !== null) {
    if (isNaN(Number(data.shippingPrice)) || Number(data.shippingPrice) < 0) {
      errors.shippingPrice = "Cena dostave mora biti pozitivan broj ili 0.";
    }
  }

  if (data.enableFreeShipping && data.freeShippingThreshold !== null && data.freeShippingThreshold !== undefined) {
    if (isNaN(Number(data.freeShippingThreshold)) || Number(data.freeShippingThreshold) < 0) {
      errors.freeShippingThreshold = "Prag za besplatnu dostavu mora biti pozitivan broj.";
    }
  }

  // 3. SMTP
  if (data.smtpPort !== undefined && data.smtpPort !== null) {
    const port = Number(data.smtpPort);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.smtpPort = "Port mora biti broj između 1 i 65535.";
    }
  }

  if (data.senderEmail && data.senderEmail.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.senderEmail.trim())) {
      errors.senderEmail = "Unesite ispravnu e-mail adresu pošiljaoca.";
    }
  }

  if (data.replyToEmail && data.replyToEmail.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.replyToEmail.trim())) {
      errors.replyToEmail = "Unesite ispravnu reply-to e-mail adresu.";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

