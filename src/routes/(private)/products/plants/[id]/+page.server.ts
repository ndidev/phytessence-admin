import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { mysql } from "$lib/server";
import { nanoid } from "$lib/utils";

export const load = (async ({ params }) => {
  // Récupération d'une plante, ou nouvelle plante
  let plant: Plant = {
    id: "",
    name: "",
    unit: "g",
    warningLow: 0,
    warningCritical: 0,
    active: true,
  };

  if (params.id !== "new") {
    const [rows] = await mysql.execute(
      `SELECT * FROM plants WHERE id = '${params.id}'`
    );

    const result = rows as Plant[];

    if (result.length === 1) {
      plant = { ...plant, ...result[0] };
    }
  }

  return {
    plant,
  };
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Créer une plante.
   */
  create: async ({ params, request }) => {
    const data = await request.formData();

    const submittedData = {
      name: String(data.get("name") ?? ""),
      unit: String(data.get("unit") ?? "g") as Plant["unit"],
      warningLow: parseInt(String(data.get("warningLow") ?? "0")),
      warningCritical: parseInt(String(data.get("warningCritical") ?? "0")),
      active: !!data.get("active"),
    } satisfies Partial<Plant>;

    if (submittedData.name === "") {
      return fail(400, {
        message: "Le nom de la plante est obligatoire",
      });
    }

    // Vérifier si le nom de la plante existe déjà
    const [rows] = await mysql.execute(
      `SELECT COUNT(*) as count FROM plants WHERE name = '${submittedData.name}'`
    );

    const result = rows as { count: number }[];

    if (result[0].count != 0) {
      return fail(400, {
        message: "Une autre plante porte déjà ce nom",
      });
    }

    const insertQuery = `INSERT INTO plants (id, name, unit, warningLow, warningCritical, active) VALUES(?, ?, ?, ?, ?, ?);`;

    await mysql.execute(insertQuery, [
      nanoid(),
      submittedData.name,
      submittedData.unit,
      submittedData.warningLow,
      submittedData.warningCritical,
      submittedData.active,
    ]);

    return {
      message: `La plante "${submittedData.name}" a été créée.`,
    };
  },

  /**
   * Mettre à jour une plante.
   */
  update: async ({ params, request }) => {
    const data = await request.formData();

    const submittedData = {
      name: String(data.get("name") ?? ""),
      unit: String(data.get("unit") ?? "g") as Plant["unit"],
      warningLow: parseInt(String(data.get("warningLow") ?? "0")),
      warningCritical: parseInt(String(data.get("warningCritical") ?? "0")),
      active: !!data.get("active"),
    } satisfies Partial<Plant>;

    if (submittedData.name === "") {
      return fail(400, {
        message: "Le nom de la plante est obligatoire",
      });
    }

    // Vérifier si le nom de la plante est disponible
    const [rows] = await mysql.execute(
      `SELECT COUNT(*) as count FROM plants
          WHERE name = '${submittedData.name}'
          AND NOT id = '${params.id}'`
    );

    const result = rows as { count: number }[];

    if (result[0].count != 0) {
      return fail(400, {
        message: "Une autre plante porte déjà ce nom",
      });
    }

    const updateQuery = `
      UPDATE plants SET
        name = '${submittedData.name}',
        unit = '${submittedData.unit}',
        warningLow = '${submittedData.warningLow}',
        warningCritical = '${submittedData.warningCritical}',
        active = '${+submittedData.active}'
      WHERE id = '${params.id}';
    `;

    await mysql.execute(updateQuery);

    return {
      message: "Les modifications ont été enregistrées.",
    };
  },

  /**
   * Supprimer une plante.
   */
  delete: async ({ params }) => {
    try {
      await mysql.execute(`DELETE FROM plants WHERE id = '${params.id}'`);

      return {
        message: "La plante a été supprimée.",
      };
    } catch (err) {
      const error = err as MySQLError;

      if (error.errno === 1451) {
        return fail(400, {
          message:
            "La plante est utilisée dans des commandes, impossible de la supprimer.",
        });
      }

      return fail(500, {
        message: "Erreur lors de la suppression.",
      });
    }
  },
} satisfies Actions;
