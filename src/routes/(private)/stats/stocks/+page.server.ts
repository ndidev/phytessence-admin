import type { PageServerLoad } from "./$types";
import { mysql } from "$lib/server";

export const load = (async () => {
  const plantsSql = "SELECT * FROM plants_stocks";

  const [plantsRows] = (await mysql.query(plantsSql)) as Array<any>;

  plantsRows.forEach((plant: any) => {
    plant.inwards = parseFloat(plant.inwards);
    plant.expected = parseFloat(plant.expected);
    plant.outwards = parseFloat(plant.outwards);
  });

  type PlantStats = {
    id: Plant["id"];
    name: Plant["name"];
    unit: Plant["unit"];
    inwards: number;
    expected: number;
    outwards: number;
  };

  const plants = plantsRows as unknown as PlantStats[];

  return {
    stats: {
      plants,
    },
  };
}) satisfies PageServerLoad;
