export const STOCK_RESERVATION_MS = 48 * 60 * 60 * 1000;

const STATUS_LABELS: Record<string, string> = {
  pending: "Na čekanju",
  processing: "U obradi",
  shipped: "Poslato",
  delivered: "Isporučeno",
  ready_for_pickup: "Spremno za preuzimanje",
  picked_up: "Preuzeto u radnji",
  cancelled: "Otkazano",
};

export function orderStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export function orderStatusClass(status: string) {
  switch (status) {
    case "delivered":
    case "picked_up":
      return "bg-emerald-50 text-emerald-700";
    case "shipped":
    case "ready_for_pickup":
      return "bg-cyan-50 text-cyan-700";
    case "processing":
      return "bg-amber-50 text-amber-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function statusOptionsFor(shippingMethod: unknown) {
  const pickup = shippingMethod === "store_pickup";
  return pickup
    ? [
        ["pending", "Na čekanju"],
        ["processing", "U obradi"],
        ["ready_for_pickup", "Spremno za preuzimanje"],
        ["picked_up", "Preuzeto u radnji"],
        ["cancelled", "Otkazano"],
      ]
    : [
        ["pending", "Na čekanju"],
        ["processing", "U obradi"],
        ["shipped", "Poslato"],
        ["delivered", "Isporučeno"],
        ["cancelled", "Otkazano"],
      ];
}

export function reservationDeadline(createdAt: string, stockReservedUntil: string | null) {
  if (stockReservedUntil) return new Date(stockReservedUntil);
  return new Date(new Date(createdAt).getTime() + STOCK_RESERVATION_MS);
}

export function formatReservationLeft(deadline: Date, now = Date.now()) {
  const ms = deadline.getTime() - now;
  if (ms <= 0) return "Istekla, zalihe se vraćaju";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / 60000);
  if (hours >= 1) return `još ${hours} h ${minutes} min`;
  return `još ${minutes} min`;
}
