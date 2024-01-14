import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json, error } from "@sveltejs/kit";
import type { ResultSetHeader } from "mysql2";

export const GET: RequestHandler = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const format = query.get("format");

  let bagTypes;
  let bagTypesRows;

  switch (format) {
    case "autocomplete":
      [bagTypesRows] = await mysql.query(`
        SELECT
          id,
          name
        FROM bagTypes
        WHERE active = 1
        ORDER BY name ASC`);
      bagTypes = bagTypesRows as BagTypeAutocomplete[];
      break;

    case "names":
      [bagTypesRows] = await mysql.query(`
        SELECT
          id,
          name
        FROM bagTypes
        ORDER BY name ASC`);
      bagTypes = bagTypesRows as BagTypeAutocomplete[];
      break;

    default:
      [bagTypesRows] = await mysql.query(`
        SELECT
          id,
          name,
          active
        FROM bagTypes
        ORDER BY name ASC`);
      bagTypes = bagTypesRows as BagType[];
      break;
  }

  // return new Response();
  return json(bagTypes);
};

export const POST: RequestHandler = async ({ request }) => {
  let { name, active } = (await request.json()) as BagType;

  const [result] = (await mysql.query(
    `INSERT INTO bagTypes (name, active) VALUES (:name, :active)`,
    { name, active }
  )) as Array<ResultSetHeader>;

  return json({ id: result.insertId, name, active }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
  let { id, name, active } = (await request.json()) as BagType;

  await mysql.query(
    `
    UPDATE bagTypes
    SET
      name = :name,
      active = :active
    WHERE id = :id`,
    { id, name, active }
  );

  return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async ({ request }) => {
  let { id } = (await request.json()) as BagType;

  if (!id) {
    throw error(400, "L'identifiant est obligatoire");
  }

  await mysql.query(`DELETE FROM bagTypes WHERE id = :id`, {
    id,
  });

  return new Response(null, { status: 204 });
};
