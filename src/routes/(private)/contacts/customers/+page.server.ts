import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async () => {
  let customers: Customer[] = [];

  const query = "SELECT * FROM customers ORDER BY name ASC";

  try {
    const [rows] = await mysql.query(query);
    customers = rows as Customer[];
  } catch {
    error(500);
  }

  return { customers };
}) satisfies PageServerLoad;
