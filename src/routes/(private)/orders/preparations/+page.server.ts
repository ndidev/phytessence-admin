import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async () => {
  type PreparedBagSummary = {
    id: PreparedBag["id"];
    number: PreparedBag["number"];
  };

  let bags: PreparedBagSummary[] = [];

  const query = `
    SELECT
      cob.id,
      cob.number
    FROM customersOrdersBags cob
    WHERE cob.orderId IS NULL
    ORDER BY cob.number DESC
    `;

  try {
    const [rows] = await mysql.query(query);
    bags = rows as PreparedBagSummary[];
  } catch (err) {
    console.error(err);
    error(500);
  }

  return { bags };
}) satisfies PageServerLoad;
