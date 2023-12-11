import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { mysql } from "$lib/server";
import { nanoid } from "$lib/utils";

export const load = (async ({ params }) => {
  // Récupération d'un fournisseur, ou nouveau fournisseur
  let supplier: Supplier = {
    id: "",
    name: "",
    comments: "",
    active: true,
  };

  let numberOfOrders = 0;

  if (params.id !== "new") {
    const [supplierRows] = (await mysql.execute(
      `SELECT * FROM suppliers WHERE id = '${params.id}'`
    )) as unknown as Array<Supplier[]>;

    if (supplierRows.length === 1) {
      supplier = { ...supplier, ...supplierRows[0] };
    }

    const [ordersRows] = (await mysql.execute(
      `SELECT COUNT(*) as count FROM suppliersOrders WHERE supplierId = '${params.id}'`
    )) as unknown as Array<{ count: number }[]>;

    numberOfOrders = ordersRows[0].count;
  }

  return {
    supplier,
    numberOfOrders,
  };
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Créer un fournisseur.
   */
  create: async ({ request }) => {
    const data = await request.formData();

    const submittedData = {
      name: String(data.get("name") ?? ""),
      comments: String(data.get("comments") ?? ""),
      active: !!data.get("active"),
    } satisfies Partial<Supplier>;

    if (submittedData.name === "") {
      return fail(400, {
        message: "Le nom du fournisseur est obligatoire",
      });
    }

    // Vérifier si le nom du fournisseur existe déjà
    const [rows] = await mysql.execute(
      `SELECT COUNT(*) as count FROM suppliers WHERE name = '${submittedData.name}'`
    );

    const result = rows as { count: number }[];

    if (result[0].count != 0) {
      return fail(400, {
        message: "Un autre fournisseur porte déjà ce nom",
      });
    }

    const insertQuery = `INSERT INTO suppliers (id, name, comments, active) VALUES(?, ?, ?, ?);`;

    await mysql.execute(insertQuery, [
      nanoid(),
      submittedData.name,
      submittedData.comments,
      submittedData.active,
    ]);

    return {
      message: `Le fournisseur "${submittedData.name}" a été créé.`,
    };
  },

  /**
   * Mettre à jour un fournisseur.
   */
  update: async ({ params, request }) => {
    const data = await request.formData();

    const submittedData = {
      name: String(data.get("name") ?? ""),
      comments: String(data.get("comments") ?? ""),
      active: !!data.get("active"),
    } satisfies Partial<Supplier>;

    if (submittedData.name === "") {
      return fail(400, {
        message: "Le nom du fournisseur est obligatoire",
      });
    }

    // Vérifier si le nom de la plante est disponible
    const [rows] = await mysql.execute(
      `SELECT COUNT(*) as count FROM suppliers
          WHERE name = '${submittedData.name}'
          AND NOT id = '${params.id}'`
    );

    const result = rows as { count: number }[];

    if (result[0].count != 0) {
      return fail(400, {
        message: "Un autre fournisseur porte déjà ce nom",
      });
    }

    const updateQuery = `
      UPDATE suppliers SET
        name = '${submittedData.name}',
        comments = '${submittedData.comments}',
        active = '${+submittedData.active}'
      WHERE id = '${params.id}';
    `;

    await mysql.execute(updateQuery);

    return {
      message: "Les modifications ont été enregistrées.",
    };
  },

  /**
   * Supprimer un fournisseur.
   */
  delete: async ({ params }) => {
    try {
      await mysql.execute(`DELETE FROM suppliers WHERE id = '${params.id}'`);

      return {
        message: "La commande a été supprimée.",
      };
    } catch (err) {
      const error = err as MySQLError;

      if (error.errno === 1451) {
        return fail(400, {
          message:
            "Le fournisseur est lié à des commandes, impossible de le supprimer.",
        });
      }

      return fail(500, {
        message: "Erreur lors de la suppression.",
      });
    }
  },
} satisfies Actions;
