import type { PageServerLoad, Actions } from "./$types";
import { mysql } from "$lib/server";
import { nanoid } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  if (!locals.user?.super) {
    redirect(302, "/");
  }

  return {};
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Importer des clients.
   */
  importCustomers: async ({ request }) => {
    const data = await request.formData();
    const csvFile = data.get("csvFile") as File;
    const csvFileText = await csvFile.text();

    let customers: Array<Partial<Customer>> = csvFileText
      .split(/\r\n|\n/)
      .slice(1) // Supprimer la ligne d'en-tête
      .map((customer) => {
        const [dataName, dataPro] = customer.split(";") as [string, "1" | "0"];

        return {
          id: nanoid(),
          name: dataName.replaceAll(/\s+/g, " ").trim(),
          pro: !!dataPro,
        };
      })
      .filter(({ name }) => name !== "");

    try {
      let customersQuery = `
        INSERT INTO customers
        (id, name, pro, comments, active)
        VALUES `;

      for (const customer of customers) {
        customersQuery += `(
          "${customer.id}",
          "${customer.name}",
          ${customer.pro ? 1 : 0},
          "",
          1
        ),`;
      }

      // Replacement de la dernière virgule
      customersQuery = customersQuery.replace(/,$/, ";");

      await mysql.beginTransaction();

      const customersPromise = mysql.query(customersQuery);

      await Promise.all([customersPromise]);

      console.log("Importation terminée");

      await mysql.commit();

      mysql.unprepare(customersQuery);
    } catch (err) {
      await mysql.rollback();

      console.error(err);

      return fail(500, { message: "Erreur lors de l'importation" });
    }

    return { message: `${customers.length} clients ont été importés` };
  },

  /**
   * Importer des commandes fournisseurs.
   */
  importSuppliersOrders: async ({ request }) => {
    const data = await request.formData();
    const csvFile = data.get("csvFile") as File;
    const csvFileText = await csvFile.text();

    type ImportedSupplierOrder = {
      supplierName: Supplier["name"];
      plantName: Plant["name"];
      orderDate: SupplierOrder["orderDate"] | null;
      deliveryDate: SupplierOrder["deliveryDate"];
      supplierReference: SupplierOrder["supplierReference"];
      batchNumberSupplier: Batch["batchNumberSupplier"];
      batchNumberPhytessence: Batch["batchNumberPhytessence"];
      phytBatchIsSupplierBatch: Batch["phytBatchIsSupplierBatch"];
      quantity: Batch["quantity"];
      unit: string;
      cost: SupplierOrderContents["cost"];
      vat: SupplierOrderContents["vat"];
      expiryDate: Batch["expiryDate"];

      // Rajout pour faciliter le traitement
      supplierId: Supplier["id"];
      orderId: SupplierOrder["id"];
      plantId: Plant["id"];
      contentsId: SupplierOrderContents["id"];
    };

    const ordersRaw: Array<ImportedSupplierOrder> = csvFileText
      .split(/\r\n|\n/)
      .slice(1) // Supprimer la ligne d'en-tête
      .map((order) => {
        const [
          supplierName,
          plantName,
          orderDate,
          deliveryDate,
          supplierReference,
          batchNumberSupplier,
          batchNumberPhytessence,
          phytBatchIsSupplierBatch,
          quantity,
          unit,
          cost,
          vat,
          cost_ttc,
          expiryDate,
        ] = order.split(";");

        return {
          supplierName,
          plantName,
          orderDate: orderDate?.split("/").reverse().join("-") || null,
          deliveryDate: deliveryDate?.split("/").reverse().join("-") || null,
          supplierReference,
          batchNumberSupplier,
          batchNumberPhytessence,
          phytBatchIsSupplierBatch: !!parseInt(phytBatchIsSupplierBatch),
          quantity:
            parseFloat(quantity?.replace(" ", "").replace(",", ".")) || 0,
          unit,
          cost: parseFloat(cost?.replace(",", ".")) || 0,
          vat: parseFloat(vat?.replace(",", ".")) || 0,
          expiryDate: expiryDate?.split("/").reverse().join("-") || null,

          supplierId: "",
          orderId: "",
          plantId: "",
          contentsId: "",
        };
      })
      .filter(
        // Suppression des lignes ne comportant pas de fournisseur ou de date de commande
        ({ supplierName, orderDate }) =>
          supplierName !== "" && orderDate !== null
      );

    let suppliersCount = 0;
    let ordersCount = 0;
    let plantsCount = 0;

    try {
      /**
       * Ordre des opérations :
       * 1. réduction du tableau des commandes pour extraire :
       *      a. chaque plante
       *      b. chaque founisseur
       *      c. chaque commande (= groupe de lots d'une même commande)
       *      d. chaque ligne de contenu par commande (= combo commande/plante/coût/TVA)
       * 2. création des requêtes SQL
       *      a. plantes
       *      b. fournisseurs
       *      c. commandes
       *      d. lignes de contenu des commandes
       *      e. lots des commandes
       * 3. insertion dans la base de données :
       *      a. liste des plantes
       *      b. liste des fournisseurs
       *      c. liste des commandes
       *      d. lignes de contenu dans chaque commande
       *      e. lots pour chaque commande
       */

      // 1.a. extraction des fournisseurs
      const suppliers = Array.from(
        new Set(ordersRaw.map(({ supplierName }) => supplierName))
      ).map((name) => ({
        id: nanoid(),
        name,
      }));

      // Mise à jour des supplierIds
      ordersRaw.forEach((line) => {
        line.supplierId =
          suppliers.find(({ name }) => name === line.supplierName)?.id || "";
      });

      // 1.b. extraction des commandes
      let orders = ordersRaw.map(
        ({ supplierId, orderDate, deliveryDate, supplierReference }) => ({
          id: "",
          supplierId,
          orderDate,
          deliveryDate,
          supplierReference,
        })
      );

      // prettier-ignore
      // @ts-expect-error
      orders = Array.from(new Set(orders.map(JSON.stringify)), JSON.parse);

      orders.forEach((order) => {
        order.id = nanoid();
      });

      // Mise à jour des orderIds
      ordersRaw.forEach((line) => {
        line.orderId =
          orders.find(
            ({ supplierId, orderDate }) =>
              orderDate === line.orderDate && supplierId === line.supplierId
          )?.id || "";
      });

      // 1.c. extraction des plantes
      let plants = ordersRaw.map(({ plantName: plant, unit }) => ({
        id: "",
        name: plant,
        unit,
      }));

      // prettier-ignore
      // @ts-expect-error
      plants = Array.from(new Set(plants.map(JSON.stringify)), JSON.parse);

      plants.forEach((plant) => {
        plant.id = nanoid();
      });

      // Mise à jour des plantIds
      ordersRaw.forEach((line) => {
        line.plantId =
          plants.find(({ name }) => name === line.plantName)?.id || "";
      });

      // 1.d. extraction des lignes de contenu par commande
      type OrderContents = {
        id: SupplierOrderContents["id"];
        orderId: SupplierOrder["id"];
        plantId: Plant["id"];
        quantity: SupplierOrderContents["quantity"];
        cost: SupplierOrderContents["cost"];
        vat: SupplierOrderContents["vat"];
      };

      let ordersContents: OrderContents[] = [];

      // Pour chaque ligne des données brutes ajouter (si nécessaire) dans le tableau ordersContents
      // Regrouper les lignes par combo commande/plante/coût/TVA
      ordersRaw.forEach(({ orderId, plantId, cost, vat, contentsId }) => {
        // Vérification si la ligne de contenu est déjà dans le tableau
        if (contentsId) {
          return;
        }

        const id = nanoid();

        const relevantLines = ordersRaw.filter(
          ({ orderId: _orderId, plantId: _plantId, cost: _cost, vat: _vat }) =>
            orderId === _orderId &&
            plantId === _plantId &&
            cost === _cost &&
            vat === _vat
        );

        relevantLines.forEach((line) => (line.contentsId = id));

        const quantity = relevantLines
          .map(({ quantity }) => quantity)
          .reduce((prev, sum) => prev + sum, 0);

        ordersContents.push({
          id,
          orderId,
          plantId,
          quantity,
          cost,
          vat,
        });
      });

      // 2. Création des requêtes SQL

      // 2.a. Plantes
      let plantsQuery = `INSERT INTO plants (id, name, unit) VALUES `;

      for (const plant of plants) {
        plantsQuery += `("${plant.id}", "${plant.name}", "${plant.unit}"),`;
      }

      // Replacement de la dernière virgule
      plantsQuery = plantsQuery.replace(/,$/, ";");

      plantsCount = plants.length;

      // 2.b. Fournisseurs
      let suppliersQuery = `INSERT INTO suppliers (id, name, comments, active) VALUES `;

      for (const supplier of suppliers) {
        suppliersQuery += `("${supplier.id}", "${supplier.name}", "", 1),`;
      }

      // Replacement de la dernière virgule
      suppliersQuery = suppliersQuery.replace(/,$/, ";");

      suppliersCount = suppliers.length;

      // 2.c. Commandes
      let ordersQuery = `
        INSERT INTO suppliersOrders
        (id, supplierId, orderDate, deliveryDate, supplierReference, comments)
        VALUES `;

      for (const order of orders) {
        ordersQuery += `(
          "${order.id}",
          "${order.supplierId}",
          ${order.orderDate ? "'" + order.orderDate + "'" : null},
          ${order.deliveryDate ? "'" + order.deliveryDate + "'" : null},
          "${order.supplierReference}",
          ""
          ),`;
      }

      // Replacement de la dernière virgule
      ordersQuery = ordersQuery.replace(/,$/, ";");

      ordersCount = orders.length;

      // 2.d. Lignes de contenu
      let ordersContentsQuery = `
          INSERT INTO suppliersOrdersContents
          (id, orderId, plantId, quantity, cost, vat)
          VALUES `;

      for (const contentsLine of ordersContents) {
        ordersContentsQuery += `(
          "${contentsLine.id}",
          "${contentsLine.orderId}",
          "${contentsLine.plantId}",
          ${contentsLine.quantity},
          ${contentsLine.cost},
          ${contentsLine.vat}
        ),`;
      }

      // Replacement de la dernière virgule
      ordersContentsQuery = ordersContentsQuery.replace(/,$/, ";");

      // 2.e. Lots
      let batchesQuery = `
      INSERT INTO batches
      ( id,
        suppliersContentsId,
        batchNumberSupplier,
        batchNumberPhytessence,
        phytBatchIsSupplierBatch,
        expiryDate,
        quantity
      ) VALUES `;

      for (const batchLine of ordersRaw) {
        batchesQuery += `(
          "${nanoid()}",
          "${batchLine.contentsId}",
          "${batchLine.batchNumberSupplier}",
          "${batchLine.batchNumberPhytessence}",
          ${batchLine.phytBatchIsSupplierBatch ? 1 : 0},
          ${batchLine.expiryDate ? "'" + batchLine.expiryDate + "'" : null},
          ${batchLine.quantity}
        ),`;
      }

      // Replacement de la dernière virgule
      batchesQuery = batchesQuery.replace(/,$/, ";");

      // 3. Insertion en base de données

      await mysql.beginTransaction();

      await mysql.query(`SET FOREIGN_KEY_CHECKS = 0`);

      await mysql.query(
        [
          plantsQuery,
          suppliersQuery,
          ordersQuery,
          ordersContentsQuery,
          batchesQuery,
        ].join("")
      );

      console.log("Importation terminée");

      await mysql.query(`SET FOREIGN_KEY_CHECKS = 1`);

      await mysql.commit();

      mysql.unprepare(plantsQuery);
      mysql.unprepare(suppliersQuery);
      mysql.unprepare(ordersQuery);
      mysql.unprepare(ordersContentsQuery);
      mysql.unprepare(batchesQuery);
    } catch (err) {
      await mysql.rollback();

      console.error(err);

      return fail(500, { message: "Erreur lors de l'importation" });
    }

    return {
      message:
        "Données importées :<br/>" +
        plantsCount +
        " plantes<br/>" +
        suppliersCount +
        " fournisseurs<br/>" +
        ordersCount +
        " commandes fournisseurs<br/>",
    };
  },

  /**
   * Supprimer toutes les données.
   */
  deleteAllData: async () => {
    const queries = `
      TRUNCATE TABLE customersOrdersBagsContents;
      TRUNCATE TABLE customersOrdersBags;
      TRUNCATE TABLE customersOrders;
      TRUNCATE TABLE customers;
      TRUNCATE TABLE batches;
      TRUNCATE TABLE suppliersOrdersContents;
      TRUNCATE TABLE suppliersOrders;
      TRUNCATE TABLE suppliers;
      TRUNCATE TABLE plants;
      `;

    try {
      await mysql.beginTransaction();

      await mysql.query(`SET FOREIGN_KEY_CHECKS = 0`);

      await mysql.query(queries);

      await mysql.query(`SET FOREIGN_KEY_CHECKS = 1`);

      await mysql.commit();

      return {
        message: "Les données ont été supprimées",
      };
    } catch (err) {
      await mysql.rollback();

      console.error(err);

      return fail(500, {
        message: "Erreur lors de la suppression des données",
      });
    }
  },
} satisfies Actions;
