import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async () => {
  type SupplierOrderSummary = {
    id: SupplierOrder["id"];
    orderDate: SupplierOrder["orderDate"];
    deliveryDate: SupplierOrder["deliveryDate"];
    attente: boolean;
    supplierName: Supplier["name"];
    supplierReference: SupplierOrder["supplierReference"];
    comments: SupplierOrder["comments"];
  };

  let orders: SupplierOrderSummary[] = [];

  const query = `
    SELECT
      so.id,
      so.orderDate,
      so.deliveryDate,
      s.name as supplierName,
      so.supplierReference,
      so.comments
    FROM suppliersOrders so
    LEFT JOIN suppliers s ON s.id = so.supplierId
    ORDER BY so.orderDate DESC, s.name ASC
    `;

  try {
    const [rows] = await mysql.query(query);
    orders = rows as SupplierOrderSummary[];
    orders.forEach((order) => {
      order.attente = !order.deliveryDate;
    });
  } catch (err) {
    console.error(err);
    error(500);
  }

  return { orders };
}) satisfies PageServerLoad;
