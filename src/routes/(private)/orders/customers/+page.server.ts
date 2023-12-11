import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async () => {
  type CustomerOrderSummary = {
    id: CustomerOrder["id"];
    orderDate: CustomerOrder["orderDate"];
    customerName: Customer["name"];
    comments: CustomerOrder["comments"];
  };

  let orders: CustomerOrderSummary[] = [];

  const query = `
    SELECT
      o.id,
      o.orderDate,
      c.name as customerName,
      o.comments
    FROM customersOrders o
    LEFT JOIN customers c ON c.id = o.customerId
    ORDER BY o.orderDate DESC, o.id DESC
    `;

  try {
    const [rows] = await mysql.query(query);
    orders = rows as CustomerOrderSummary[];
  } catch (err) {
    console.error(err);
    throw error(500);
  }

  return { orders };
}) satisfies PageServerLoad;
