import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async () => {
  let plants: Plant[] = [];

  const query = "SELECT * FROM plants ORDER BY name ASC";

  try {
    const [result, fields] = await mysql.query(query);
    plants = result as Plant[];
  } catch {
    error(500);
  }

  return { plants };
}) satisfies PageServerLoad;
