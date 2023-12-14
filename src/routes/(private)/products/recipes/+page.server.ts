import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async () => {
  let recipes: Recipe[] = [];

  const query = `SELECT * FROM recipes ORDER BY name`;

  try {
    const [rows] = (await mysql.query(query)) as unknown as Array<Recipe[]>;
    recipes = rows;
  } catch (err) {
    console.error(err);
    throw error(500);
  }

  return { recipes };
}) satisfies PageServerLoad;
