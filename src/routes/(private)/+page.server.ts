import type { PageServerLoad } from "./$types";
import { mysql } from "$lib/server";

export const load = (async () => {
  type LowStock = {
    plantId: Plant["id"];
    plantName: Plant["name"];
    unit: Plant["unit"];
    currentStock: number;
    warningLow: Plant["warningLow"];
    warningCritical: Plant["warningCritical"];
  };

  /**
   * Commandes fournisseurs en attente.
   */
  const expectedSuppliersOrders: SupplierOrder[] = [];

  /**
   * Stocks bas.
   */
  const lowStocks: LowStock[] = [];

  const lowStocksSql = `
    SELECT
      
  `;

  return { expectedSuppliersOrders, lowStocks };
}) satisfies PageServerLoad;
