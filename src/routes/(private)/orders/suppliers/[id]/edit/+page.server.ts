import type { PageServerLoad, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { mysql } from "$lib/server";
import { createNewId, isNewId, nanoid, parseFormData } from "$lib/utils";

export const load = (async ({ fetch, params, url }) => {
  // Récupération d'une commande, ou nouvelle commande
  let order: SupplierOrder = {
    id: "",
    supplierId: "",
    orderDate: "",
    deliveryDate: null,
    supplierReference: null,
    contents: [],
    comments: "",
  };

  const copy = url.searchParams.get("copy");

  const orderId = params.id === "new" ? copy : params.id;

  if (orderId) {
    const [orderRows] = await mysql.execute(
      `SELECT * FROM suppliersOrders WHERE id = :orderId`,
      { orderId }
    );

    const orderResult = orderRows as SupplierOrder[];

    if (orderResult.length !== 1) {
      throw error(404, "Commande non trouvée");
    }

    order = { ...order, ...orderResult[0] };

    const [contents] = (await mysql.execute(
      `SELECT
          c.*
        FROM suppliersOrdersContents c
        JOIN plants p ON p.id = c.plantId
        WHERE orderId = :orderId
        ORDER BY p.name`,
      {
        orderId,
      }
    )) as unknown as Array<SupplierOrder["contents"]>;

    const contentsId = contents.map(({ id }) => id);

    if (contentsId.length > 0) {
      const [batchesRows] = (await mysql.query(
        `SELECT *
          FROM batches
          WHERE suppliersContentsId IN (:contentsIds)
          ORDER BY CAST(batchNumberPhytessence AS UNSIGNED)`,
        {
          contentsIds: contents.map(({ id }) => id),
        }
      )) as unknown as Array<SupplierOrder["contents"][number]["batches"]>;

      contents.forEach((content) => {
        content.batches = batchesRows.filter(
          ({ suppliersContentsId }) => suppliersContentsId === content.id
        );
      });

      order.contents = contents;
    }

    if (copy) {
      order.id = "";
      order.orderDate = "";
      order.deliveryDate = "";
      order.supplierReference = "";
      order.contents.forEach((contents) => {
        contents.id = createNewId();
        contents.batches = [];
      });
    }
  }

  // Liste des fournisseurs
  const suppliersResponse = await fetch("/api/suppliers?format=autocomplete");
  const suppliers = (await suppliersResponse.json()) as SupplierAutocomplete[];

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=autocomplete");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  return {
    order,
    suppliers,
    plants,
  };
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Créer une commande fournisseur.
   */
  create: async ({ request }) => {
    const data = await request.formData();
    const parsedData = parseFormData<SupplierOrder>(data);

    /* Validation */
    let validationError = false;
    let validationErrorMessage: string[] = [];

    if (!parsedData.supplierId) {
      validationError = true;
      validationErrorMessage.push("Le fournisseur est obligatoire.");
    }

    if (!parsedData.orderDate) {
      validationError = true;
      validationErrorMessage.push("La date de commande est obligatoire.");
    }

    if (validationError) {
      return fail(400, {
        message: validationErrorMessage.join("<br>"),
      });
    }
    /* Fin validation */

    const orderId = nanoid();

    try {
      await mysql.beginTransaction();

      // Commande
      await mysql.execute(
        `INSERT INTO suppliersOrders
          SET
            id = :id,
            supplierId = :supplierId,
            orderDate = :orderDate,
            deliveryDate = :deliveryDate,
            supplierReference = :supplierReference,
            comments = :comments
      `,
        {
          id: orderId,
          supplierId: parsedData.supplierId,
          orderDate: parsedData.orderDate || null,
          deliveryDate: parsedData.deliveryDate || null,
          supplierReference: parsedData.supplierReference,
          comments: parsedData.comments,
        }
      );

      // Contents
      for (const contentsLine of parsedData.contents || []) {
        const contentsId = nanoid();

        await mysql.execute(
          `INSERT INTO suppliersOrdersContents
            SET
              id = :contentsId,
              orderId = :orderId,
              plantId = :plantId,
              quantity = :quantity,
              cost = :cost,
              vat = :vat
        `,
          {
            contentsId,
            orderId,
            plantId: contentsLine.plantId,
            quantity: contentsLine.quantity,
            cost: contentsLine.cost,
            vat: contentsLine.vat,
          }
        );

        // Batches
        let lastBatchNumberPhytessence = await getLastBatchNumberPhytessence();

        for (const batch of contentsLine.batches || []) {
          await mysql.execute(
            `INSERT INTO batches
              SET
                id = :id,
                suppliersContentsId = :contentsId,
                batchNumberSupplier = :batchNumberSupplier,
                batchNumberPhytessence = :batchNumberPhytessence,
                phytBatchIsSupplierBatch = :phytBatchIsSupplierBatch,
                expiryDate = :expiryDate,
                quantity = :quantity
          `,
            {
              id: nanoid(),
              contentsId,
              batchNumberSupplier: batch.batchNumberSupplier,
              batchNumberPhytessence:
                batch.batchNumberPhytessence || ++lastBatchNumberPhytessence,
              phytBatchIsSupplierBatch: !!batch.phytBatchIsSupplierBatch,
              expiryDate: batch.expiryDate || null,
              quantity: batch.quantity,
            }
          );
        }
      }

      await mysql.commit();
    } catch (e) {
      await mysql.rollback();

      console.error(e);

      return fail(500, {
        message: "Erreur lors de la création",
      });
    }

    return {
      message: `La commande a été créée.`,
      orderId,
    };
  },

  /**
   * Mettre à jour une commande fournisseur.
   */
  update: async ({ params, request }) => {
    const data = await request.formData();
    const parsedData = parseFormData<SupplierOrder>(data);

    /* Validation */
    let validationError = false;
    let validationErrorMessage: string[] = [];

    if (!parsedData.supplierId) {
      validationError = true;
      validationErrorMessage.push("Le fournisseur est obligatoire.");
    }

    if (!parsedData.orderDate) {
      validationError = true;
      validationErrorMessage.push("La date de commande est obligatoire.");
    }

    if (validationError) {
      return fail(400, {
        message: validationErrorMessage.join("<br>"),
      });
    }
    /* Fin validation */

    try {
      await mysql.beginTransaction();

      const orderId = params.id;

      // Commande
      await mysql.execute(
        `UPDATE suppliersOrders
          SET
            supplierId = :supplierId,
            orderDate = :orderDate,
            deliveryDate = :deliveryDate,
            supplierReference = :supplierReference,
            comments = :comments
          WHERE
            id = :id
        `,
        {
          id: orderId,
          supplierId: parsedData.supplierId,
          orderDate: parsedData.orderDate || null,
          deliveryDate: parsedData.deliveryDate || null,
          supplierReference: parsedData.supplierReference,
          comments: parsedData.comments,
        }
      );

      parsedData.contents ||= [];

      // Contents
      const contentIds =
        parsedData.contents.length === 0
          ? [""]
          : parsedData.contents.map(({ id }) => id);

      // Supprimer les lignes de contenu qui ne sont pas dans les données transmises
      await mysql.query(
        `DELETE FROM suppliersOrdersContents
          WHERE orderId = :orderId
          AND NOT id IN(:contentIds)`,
        {
          orderId,
          contentIds,
        }
      );

      let lastBatchNumberPhytessence = await getLastBatchNumberPhytessence();

      // Ajouter ou mettre à jour les lignes transmises
      for (const contentsLine of parsedData.contents) {
        const contentsId = isNewId(contentsLine.id)
          ? nanoid()
          : contentsLine.id;

        const contentsSql = isNewId(contentsLine.id)
          ? `INSERT INTO suppliersOrdersContents
              SET
                id = :contentsId,
                orderId = :orderId,
                plantId = :plantId,
                quantity = :quantity,
                cost = :cost,
                vat = :vat`
          : `UPDATE suppliersOrdersContents
              SET
                orderId = :orderId,
                plantId = :plantId,
                quantity = :quantity,
                cost = :cost,
                vat = :vat
              WHERE
                id = :contentsId`;

        await mysql.execute(contentsSql, {
          contentsId,
          orderId,
          plantId: contentsLine.plantId,
          quantity: contentsLine.quantity,
          cost: contentsLine.cost,
          vat: contentsLine.vat,
        });

        contentsLine.batches ||= [];

        // Batches
        const batchesIds =
          contentsLine.batches.length === 0
            ? [""]
            : contentsLine.batches.map(({ id }) => id);

        // Supprimer les lignes de lots qui ne sont pas dans les données transmises
        await mysql.query(
          `DELETE FROM batches
            WHERE suppliersContentsId = :contentsId
            AND NOT id IN(:batchesIds)`,
          {
            contentsId,
            batchesIds,
          }
        );

        for (const batch of contentsLine.batches) {
          const batchId = isNewId(batch.id) ? nanoid() : batch.id;

          const batchSql = isNewId(batch.id)
            ? `INSERT INTO batches
                SET
                  id = :batchId,
                  suppliersContentsId = :contentsId,
                  batchNumberSupplier = :batchNumberSupplier,
                  batchNumberPhytessence = :batchNumberPhytessence,
                  phytBatchIsSupplierBatch = :phytBatchIsSupplierBatch,
                  expiryDate = :expiryDate,
                  quantity = :quantity`
            : `UPDATE batches
                SET
                  suppliersContentsId = :contentsId,
                  batchNumberSupplier = :batchNumberSupplier,
                  batchNumberPhytessence = :batchNumberPhytessence,
                  phytBatchIsSupplierBatch = :phytBatchIsSupplierBatch,
                  expiryDate = :expiryDate,
                  quantity = :quantity
                WHERE
                  id = :batchId`;

          await mysql.execute(batchSql, {
            batchId,
            contentsId,
            batchNumberSupplier: batch.batchNumberSupplier,
            batchNumberPhytessence:
              batch.batchNumberPhytessence || ++lastBatchNumberPhytessence,
            phytBatchIsSupplierBatch: !!batch.phytBatchIsSupplierBatch,
            expiryDate: batch.expiryDate || null,
            quantity: batch.quantity,
          });
        }
      }

      await mysql.commit();
    } catch (error) {
      await mysql.rollback();

      console.error(error);

      return fail(500, {
        message: "Erreur lors de la mise à jour.",
      });
    }

    return {
      message: "La commande a été modifiée.",
    };
  },

  /**
   * Supprimer une commande fournisseur.
   */
  delete: async ({ params }) => {
    try {
      await mysql.execute(
        `DELETE FROM suppliersOrders WHERE id = '${params.id}'`
      );

      return {
        message: "La commande a été supprimée.",
      };
    } catch (err) {
      const error = err as MySQLError;

      if (error.errno === 1451) {
        return fail(400, {
          message:
            "Les lots de cette commande sont utilisés dans des commandes clients.<br/>Impossible de supprimer la commande.",
        });
      }

      return fail(500, {
        message: "Erreur lors de la suppression.",
      });
    }
  },
} satisfies Actions;

/**
 * Fonctions utilitaires
 */

/**
 * Récupérer le dernier numéro de lot Phyt'Essence en base de données.
 */
async function getLastBatchNumberPhytessence() {
  const [batchNumberPhytessenceRows] = (await mysql.execute(
    `SELECT MAX(batchNumber) as lastBatchNumber
      FROM
        (SELECT CAST(batchNumberPhytessence AS UNSIGNED) as batchNumber
        FROM batches
        WHERE
          batchNumberPhytessence REGEXP '^[0-9]+$'
        AND
          phytBatchIsSupplierBatch = 0) n`
  )) as unknown as Array<{ lastBatchNumber: string }[]>;

  const lastBatchNumberPhytessence =
    parseInt(batchNumberPhytessenceRows[0].lastBatchNumber) || 0;

  return lastBatchNumberPhytessence;
}
