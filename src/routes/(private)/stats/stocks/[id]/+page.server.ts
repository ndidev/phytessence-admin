import type { PageServerLoad } from "./$types";
import { mysql } from "$lib/server";

export const load = (async ({ params }) => {
  const plantSql = `SELECT * FROM plants_stocks WHERE id = :id`;

  const inwardSql = `
    SELECT
      b.id as batchId,
      b.batchNumberPhytessence,
      b.batchNumberSupplier,
      b.quantity,
      so.deliveryDate
    FROM
      batches b
    JOIN
      suppliersOrdersContents soc ON soc.id = b.suppliersContentsId
    JOIN
      suppliersOrders so ON so.id = soc.orderId
    WHERE
      soc.plantId = :id
    ORDER BY
      so.deliveryDate DESC`;

  const outwardSql = `
    SELECT
      co.id as orderId,
      co.orderDate,
      cob.id as bagId,
      cob.number as bagNumber,
      b.id as batchId,
      b.batchNumberPhytessence,
      cobc.quantity
    FROM
      customersOrdersBagsContents cobc
    JOIN
      customersOrdersBags cob ON cob.id = cobc.bagId
    JOIN
      customersOrders co ON co.id = cob.orderId
    JOIN
      batches b ON b.id = cobc.batchId
    WHERE
      cobc.plantId = :id
    ORDER BY
      co.orderDate DESC`;

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
