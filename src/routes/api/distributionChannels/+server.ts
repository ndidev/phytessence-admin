import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json, error } from "@sveltejs/kit";
import type { ResultSetHeader } from "mysql2";

export const GET: RequestHandler = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const format = query.get("format");

  let distributionChannels;
  let distributionChannelsRows;

  switch (format) {
    case "autocomplete":
      [distributionChannelsRows] = await mysql.query(`
        SELECT
          id,
          name
        FROM distributionChannels
        WHERE active = 1
        ORDER BY name ASC`);
      distributionChannels =
        distributionChannelsRows as DistributionChannelAutocomplete[];
      break;

    case "names":
      [distributionChannelsRows] = await mysql.query(`
        SELECT
          id,
          name
        FROM distributionChannels
        ORDER BY name ASC`);
      distributionChannels =
        distributionChannelsRows as DistributionChannelAutocomplete[];
      break;

    default:
      [distributionChannelsRows] = await mysql.query(`
        SELECT
          id,
          name,
          active
        FROM distributionChannels
        ORDER BY name ASC`);
      distributionChannels = distributionChannelsRows as DistributionChannel[];
      break;
  }

  // return new Response();
  return json(distributionChannels);
};

export const POST: RequestHandler = async ({ request }) => {
  let { name, active } = (await request.json()) as DistributionChannel;

  const [result] = (await mysql.query(
    `INSERT INTO distributionChannels (name, active) VALUES (:name, :active)`,
    { name, active }
  )) as Array<ResultSetHeader>;

  return json({ id: result.insertId, name, active }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
  let { id, name, active } = (await request.json()) as DistributionChannel;

  await mysql.query(
    `
    UPDATE distributionChannels
    SET
      name = :name,
      active = :active
    WHERE id = :id`,
    { id, name, active }
  );

  return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async ({ request }) => {
  let { id } = (await request.json()) as DistributionChannel;

  if (!id) {
    throw error(400, "L'identifiant est obligatoire");
  }

  await mysql.query(`DELETE FROM distributionChannels WHERE id = :id`, {
    id,
  });

  return new Response(null, { status: 204 });
};
