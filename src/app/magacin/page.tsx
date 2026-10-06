import { requireWarehouseAccess } from "@/lib/admin-auth";
import { getWarehouseData } from "@/actions/warehouse-actions";
import { WarehouseClient } from "./warehouse-client";

export const dynamic = "force-dynamic";

export default async function WarehousePage() {
  await requireWarehouseAccess();
  const data = await getWarehouseData();
  return <WarehouseClient initialData={data} />;
}
