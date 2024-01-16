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
      cf.customerId,
      cf.customerName,
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
    line.deliveryDate =
      new Date(line.deliveryDate).toLocaleDateString("fr-FR") ?? "en attente";
  });

  outwardDetailsRows.forEach((line: any) => {
    line.quantity = parseFloat(line.quantity);
    line.orderDate =
      new Date(line.orderDate).toLocaleDateString("fr-FR") ?? "date inconnue";
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
    customerId: Customer["id"] | null;
    customerName: Customer["name"] | null;
    orderId: CustomerOrder["id"] | null;
    orderDate: string | null;
    bagId: CustomerOrderBag["id"];
    bagNumber: CustomerOrderBag["number"];
    batchId: ID;
    batchNumberPhytessence: Batch["batchNumberPhytessence"];
    quantity: Quantity;
  };

  const plant = plantRow[0] as unknown as PlantStats;
  const inwardDetails = inwardDetailsRows as unknown as InwardStats[];
  const outwardDetails = outwardDetailsRows as unknown as OutwardStats[];

  console.log({
    outwardDetails,
    preparedBags: outwardDetails.filter(({ customerId }) => !customerId),
    customers: outwardDetails.filter(({ customerId }) => customerId),
  });

  const preparedBags = outwardDetails
    .filter(({ customerId }) => !customerId)
    .map((line) => ({
      bagId: line.bagId,
      bagNumber: line.bagNumber,
      batchId: line.batchId,
      batchNumberPhytessence: line.batchNumberPhytessence,
      quantity: line.quantity,
    }));

  const customersIdsDone: Customer["id"][] = [];

  const customers = outwardDetails
    .filter(({ customerId }) => customerId)
    .map(({ customerId, customerName }) => {
      customerId = customerId as string;

      if (customersIdsDone.includes(customerId)) return;

      customersIdsDone.push(customerId);

      const customersSieve = outwardDetails.filter(
        (line_) => customerId === line_.customerId
      );

      const customersOrdersIdsDone: ID[] = [];

      return {
        name: customerName,
        orders: customersSieve
          .map(({ orderDate, orderId }) => {
            orderId = orderId as string;

            if (customersOrdersIdsDone.includes(orderId)) return;

            customersOrdersIdsDone.push(orderId);

            const customerOrderSieve = customersSieve.filter(
              (line_) => orderId === line_.orderId
            );

            return {
              orderDate,
              bags: customerOrderSieve
                .map(
                  ({
                    bagNumber,
                    bagId,
                    quantity,
                    batchId,
                    batchNumberPhytessence,
                  }) => ({
                    id: bagId,
                    number: bagNumber,
                    batchId,
                    batchNumberPhytessence,
                    quantity,
                  })
                )
                .filter((bag) => bag),
            };
          })
          .filter((customerOrder) => customerOrder),
      };
    })
    .filter((customer) => customer);

  return {
    plant,
    details: {
      inward: inwardDetails,
      outward: {
        preparedBags,
        customers,
      },
    },
  };
}) satisfies PageServerLoad;
