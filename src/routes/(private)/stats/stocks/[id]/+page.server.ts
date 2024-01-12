import type { PageServerLoad } from "./$types";
import { mysql } from "$lib/server";

export const load = (async ({ params }) => {
  const plantSql = `SELECT * FROM plants_stocks WHERE id = :id`;

  const inwardSql = `
    SELECT
      sf.batchId,
      sf.batchNumberPhytessence,
      sf.batchNumberSupplier,
      sf.quantity,
      sf.deliveryDate
    FROM
      suppliersFull sf
    WHERE
      sf.plantId = :id
    ORDER BY
      sf.deliveryDate DESC`;

  const outwardSql = `
    SELECT
      cf.orderId,
      cf.orderDate,
      cf.bagId,
      cf.bagNumber,
      cf.batchId,
      b.batchNumberPhytessence,
      cf.quantity
    FROM
      customersFull cf
    JOIN
      batches b ON b.id = cf.batchId
    WHERE
      cf.plantId = :id
    ORDER BY
      cf.orderDate DESC`;

  const [plantRow] = (await mysql.query(plantSql, {
    id: params.id,
  })) as Array<any>;

  const [inwardDetailsRows] = (await mysql.query(inwardSql, {
    id: params.id,
  })) as Array<any>;

  const [outwardDetailsRows] = (await mysql.query(outwardSql, {
    id: params.id,
  })) as Array<any>;

  plantRow.forEach((plant: any) => {
    plant.inwards = parseFloat(plant.inwards);
    plant.expected = parseFloat(plant.expected);
    plant.outwards = parseFloat(plant.outwards);
  });

  inwardDetailsRows.forEach((line: any) => {
    line.quantity = parseFloat(line.quantity);
    line.deliveryDate = line.deliveryDate
      ? new Date(line.deliveryDate).toLocaleDateString("fr-FR")
      : "en attente";
  });

  outwardDetailsRows.forEach((line: any) => {
    line.quantity = parseFloat(line.quantity);
    line.orderDate = line.orderDate
      ? new Date(line.orderDate).toLocaleDateString("fr-FR")
      : "date inconnue";
  });

  type PlantStats = {
    id: Plant["id"];
    name: Plant["name"];
    unit: Plant["unit"];
    inwards: number;
    expected: number;
    outwards: number;
  };

  type InwardStats = {
    batchId: Batch["id"];
    batchNumberPhytessence: Batch["batchNumberPhytessence"];
    batchNumberSupplier: Batch["batchNumberSupplier"];
    quantity: Quantity;
    deliveryDate: string;
  };

  type OutwardStats = {
    orderId: CustomerOrder["id"];
    orderDate: string;
    bagId: CustomerOrderBag["id"];
    bagNumber: CustomerOrderBag["number"];
    batchId: ID;
    batchNumberPhytessence: Batch["batchNumberPhytessence"];
    quantity: Quantity;
  };

  const plant = plantRow[0] as unknown as PlantStats;
  const inwardDetails = inwardDetailsRows as unknown as InwardStats[];
  const outwardDetails = outwardDetailsRows as unknown as OutwardStats[];

  return {
    plant,
    details: {
      inward: inwardDetails,
      outward: outwardDetails,
    },
  };
}) satisfies PageServerLoad;
