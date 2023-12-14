import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async () => {
  let suppliers: Supplier[] = [];

  const query = "SELECT * FROM suppliers ORDER BY name ASC";

  try {
    const [rows] = await mysql.query(query);
    suppliers = rows as Supplier[];
  } catch {
    error(500);
  }

  return { suppliers };
}) satisfies PageServerLoad;
