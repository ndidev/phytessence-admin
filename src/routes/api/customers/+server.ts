import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const format = query.get("format");

  let customers;
  let customersRows;

  switch (format) {
    case "names":
      [customersRows] = await mysql.query(
        `SELECT id, name
          FROM customers
          ORDER BY name ASC`
      );
      customers = customersRows as CustomerAutocomplete[];
      break;

    case "autocomplete":
      [customersRows] = await mysql.query(
        `SELECT id, name
          FROM customers
          WHERE active = 1
          ORDER BY name ASC`
      );
      customers = customersRows as CustomerAutocomplete[];
      break;

    default:
      [customersRows] = await mysql.query(`SELECT * FROM customers`);
      customers = customersRows as Customer[];
      break;
  }

  // return new Response();
  return json(customers);
};
