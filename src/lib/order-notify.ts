import { formatPrice } from "@/lib/utils";

type OrderEmailInput = {
  orderNumber: string;
  confirmationToken: string;
  total: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  shippingMethod: string;
  items: { name: string; quantity: number; total: number }[];
};

function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "https://aqua-still-shop.vercel.app";
}

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status}: ${body.slice(0, 300)}`);
  }

  return true;
}

export async function notifyOrderCreated(input: OrderEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;
  if (!apiKey || !from) {
    console.info("Order email skipped: set RESEND_API_KEY and ORDER_FROM_EMAIL.");
    return;
  }

  const lines = input.items.map((item) => `- ${item.name} × ${item.quantity} (${formatPrice(item.total)})`).join("\n");
  const pickup = input.shippingMethod === "store_pickup";
  const link = `${siteUrl()}/porudzbina/${encodeURIComponent(input.orderNumber)}?key=${encodeURIComponent(input.confirmationToken)}`;

  const customerText = [
    `Poštovani ${input.firstName},`,
    "",
    `Primili smo porudžbinu ${input.orderNumber}.`,
    `Ukupno za uplatu: ${formatPrice(input.total)}.`,
    pickup
      ? "Preuzimanje je u Aqua Still Zlatibor salonu, narednog dana nakon potvrde da je porudžbina spremna."
      : "Plaćanje je pouzećem kuriru.",
    "Zalihe su rezervisane 48 sati dok radnja ne potvrdi porudžbinu.",
    "",
    lines,
    "",
    `Detalji: ${link}`,
    "",
    "Aqua Still Zlatibor",
  ].join("\n");

  try {
    await sendEmail(input.email, `Aqua Still porudžbina ${input.orderNumber}`, customerText);
  } catch (error) {
    console.error("Customer order email failed:", error);
  }

  const shopInbox = process.env.ORDER_NOTIFY_EMAIL?.trim();
  if (!shopInbox || shopInbox.toLowerCase() === input.email.toLowerCase()) return;

  const shopText = [
    `Nova porudžbina ${input.orderNumber}.`,
    `${input.firstName} ${input.lastName}`,
    `Telefon: ${input.phone}`,
    `Email: ${input.email}`,
    pickup ? "Lično preuzimanje u radnji" : `Dostava: ${input.address}`,
    `Ukupno: ${formatPrice(input.total)}`,
    "",
    lines,
    "",
    "Ako porudžbina ostane na čekanju duže od 48 sati, zalihe se automatski vraćaju.",
    "Premestite je u obradu ako je prihvatate.",
  ].join("\n");

  try {
    await sendEmail(shopInbox, `Nova porudžbina ${input.orderNumber}`, shopText);
  } catch (error) {
    console.error("Shop order email failed:", error);
  }
}
