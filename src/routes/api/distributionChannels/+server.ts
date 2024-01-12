import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json } from "@sveltejs/kit";

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
      [distributionChannelsRows] = await mysql.query(
        `SELECT id, name
          FROM distributionChannels
          ORDER BY name ASC`
      );
      distributionChannels = distributionChannelsRows as DistributionChannel[];
      break;
  }

  // return new Response();
  return json(distributionChannels);
};
