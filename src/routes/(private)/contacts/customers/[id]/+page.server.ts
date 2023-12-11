import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { mysql } from "$lib/server";
import { nanoid } from "$lib/utils";

export const load = (async ({ params }) => {
  // Récupération d'un client, ou nouveau client
  let customer: Customer = {
    id: "",
    name: "",
    pro: false,
    comments: "",
    active: true,
  };

  let numberOfOrders = 0;

  if (params.id !== "new") {
    const [rows] = await mysql.execute(
      `SELECT * FROM customers WHERE id = '${params.id}'`
    );

    const result = rows as Customer[];

    if (result.length === 1) {
      customer = { ...customer, ...result[0] };
    }

    const [ordersRows] = (await mysql.execute(
      `SELECT COUNT(*) as count FROM customersOrders WHERE customerId = '${params.id}'`
    )) as unknown as Array<{ count: number }[]>;

    numberOfOrders = ordersRows[0].count;
  }

  return {
    customer,
    numberOfOrders,
  };
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Créer un client.
   */
  create: async ({ request }) => {
    const data = await request.formData();

    const submittedData = {
      name: String(data.get("name") ?? ""),
      pro: !!data.get("pro"),
      comments: String(data.get("comments") ?? ""),
      active: !!data.get("active"),
    } satisfies Partial<Customer>;

    if (submittedData.name === "") {
      return fail(400, {
        message: "Le nom du client est obligatoire",
      });
    }

    // Vérifier si le nom du client existe déjà
    const [rows] = await mysql.execute(
      `SELECT COUNT(*) as count FROM customers WHERE name = '${submittedData.name}'`
    );

    const result = rows as { count: number }[];

    if (result[0].count != 0) {
      return fail(400, {
        message: "Un autre client porte déjà ce nom",
      });
    }

    const insertQuery = `INSERT INTO customers (id, name, pro, comments, active) VALUES(?, ?, ?, ?, ?);`;

    await mysql.execute(insertQuery, [
      nanoid(),
      submittedData.name,
      +submittedData.pro,
      submittedData.comments,
      submittedData.active,
    ]);

    return {
      message: `Le client "${submittedData.name}" a été créé.`,
    };
  },

  /**
   * Mettre à jour un client.
   */
  update: async ({ params, request }) => {
    const data = await request.formData();

    const submittedData = {
      name: String(data.get("name") ?? ""),
      pro: !!data.get("pro"),
      comments: String(data.get("comments") ?? ""),
      active: !!data.get("active"),
    } satisfies Partial<Customer>;

    if (submittedData.name === "") {
      return fail(400, {
        message: "Le nom du client est obligatoire",
      });
    }

    // Vérifier si le nom de la plante est disponible
    const [rows] = await mysql.execute(
      `SELECT COUNT(*) as count FROM customers
          WHERE name = '${submittedData.name}'
          AND NOT id = '${params.id}'`
    );

    const result = rows as { count: number }[];

    if (result[0].count != 0) {
      return fail(400, {
        message: "Un autre client porte déjà ce nom",
      });
    }

    const updateQuery = `
      UPDATE customers SET
        name = '${submittedData.name}',
        pro = '${+submittedData.pro}',
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
   * Supprimer un client.
   */
  delete: async ({ params }) => {
    // Vérifier si le client existe
    const [customerRows] = await mysql.execute(
      `SELECT id FROM customers WHERE id = '${params.id}';`
    );

    const customerResult = customerRows as { id: Customer["id"] }[];
    const customerExists = customerResult.length > 0;

    if (!customerExists) {
      return fail(404, {
        message: `Le client n'existe pas.`,
      });
    }

    const customerId = customerResult[0].id;

    // Vérifier si le client est lié à des commandes
    const [ordersCountRows] = await mysql.execute(
      `SELECT COUNT(*) as ordersCount FROM customersOrders WHERE customerId = '${customerId}'`
    );

    const ordersCountResult = ordersCountRows as { ordersCount: number }[];
    const { ordersCount } = ordersCountResult[0];

    if (ordersCount > 0) {
      return fail(400, {
        message:
          "Le client est lié à des commandes, impossible de le supprimer.",
      });
    }

    // Supprimer le client
    await mysql.execute(`DELETE FROM customers WHERE id = '${customerId}'`);

    return {
      message: "Le client a été supprimé.",
    };
  },
} satisfies Actions;
