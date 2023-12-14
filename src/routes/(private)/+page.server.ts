import type { PageServerLoad } from "./$types";
import { mysql } from "$lib/server";

export const load = (async () => {
  type ExpectedSupplierOrder = {
    id: SupplierOrder["id"];
    supplierName: Supplier["name"];
    orderDate: SupplierOrder["orderDate"];
    contents: {
      plantName: Plant["name"];
      quantity: number;
      unit: Plant["unit"];
    }[];
  };

  type LowStock = {
    plantId: Plant["id"];
    name: Plant["name"];
    unit: Plant["unit"];
    currentStock: number;
    expected: number;
    low: boolean;
    critical: boolean;
  };

  /**
   * Commandes fournisseurs en attente.
   */
  const expectedSuppliersOrdersSql = `
    SELECT
      so.id,
      so.orderDate,
      s.name as supplierName,
      p.name as plantName,
      p.unit,
      soc.quantity
    FROM
      suppliersOrders so
    JOIN suppliers s ON so.supplierId = s.id
    JOIN suppliersOrdersContents soc ON soc.orderId = so.id
    JOIN plants p ON p.id = soc.plantId
    WHERE
      so.deliveryDate IS NULL
  `;

  const [expectedSuppliersOrdersRows] = (await mysql.query(
    expectedSuppliersOrdersSql
  )) as unknown as Array<any>;

  const idsDone: ID[] = [];

  const expectedSuppliersOrders = expectedSuppliersOrdersRows
    .map((order: any) => {
      if (idsDone.includes(order.id)) return;

      idsDone.push(order.id);

      return {
        id: order.id,
        supplierName: order.supplierName,
        orderDate: order.orderDate,
        contents: expectedSuppliersOrdersRows
          .filter(({ id }: { id: ID }) => order.id === id)
          .map(
            ({
              plantName,
              quantity,
              unit,
            }: {
              plantName: Plant["name"];
              quantity: string;
              unit: Plant["unit"];
            }) => ({ plantName, quantity: parseFloat(quantity), unit })
          ),
      };
    })
    .filter((order: ExpectedSupplierOrder) => order) as ExpectedSupplierOrder[];

  /**
   * Stocks bas.
   */
  const lowStocksSql = `
    SELECT
      s.id as plantId,
      s.name,
      s.unit,
      s.currentStock,
      s.expected,
      s.currentStock <= p.warningLow as low,
      s.currentStock <= p.warningCritical as critical
    FROM plants_stocks s
    JOIN plants p ON p.id = s.id
    WHERE
      p.active = 1
    AND
      s.currentStock <= p.warningLow
    AND
      (p.warningLow + p.warningCritical) > 0
    ORDER BY
      p.name
  `;

  const [lowStocksRows] = (await mysql.query(
    lowStocksSql
  )) as unknown as Array<any>;

  lowStocksRows.forEach((lowStock: any) => {
    lowStock.currentStock = parseFloat(lowStock.currentStock);
    lowStock.expected = parseFloat(lowStock.expected);
    lowStock.low = !!lowStock.low;
    lowStock.critical = !!lowStock.critical;
  });

  const lowStocks = lowStocksRows as LowStock[];

  return { expectedSuppliersOrders, lowStocks };
}) satisfies PageServerLoad;
