import { releaseExpiredStockReservations } from "@/lib/order-stock";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const released = await releaseExpiredStockReservations();
    return Response.json({ released });
  } catch (error) {
    console.error("Reservation release cron failed:", error);
    return Response.json({ error: "Release failed" }, { status: 500 });
  }
}
