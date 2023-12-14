import type { PageServerLoad, Actions } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql, setSessionCookie } from "$lib/server";
import bcrypt from "bcrypt";

export const load = (async ({ locals }) => {
  const user = locals.user as User;
  return { user };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals, cookies }) => {
    if (!locals.user) {
      error(401, "Utilisateur non authentifié");
    }

    const formData = await request.formData();

    const name = String(formData.get("name") || "");
    const login = String(formData.get("login") || "");
    const email = String(formData.get("email") || "");
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const actionData = {
      name,
      login,
      email,
      success: true,
      errors: {
        general: false,
        nameMissing: !name,
        loginMissing: !login,
        emailMissing: !email,
        currentPasswordMissing: false,
        currentPasswordIncorrect: false,
        passwordMismatch: false,
      },
    };

    let anyErrors = false;
    let passwordCanBeChanged = false;

    // Vérification nouveau mot de passe
    if (newPassword) {
      try {
        if (newPassword !== confirmPassword) {
          actionData.errors.passwordMismatch = true;
          throw new Error();
        }

        const [currentPasswordRow] = (await mysql.execute(
          `SELECT password FROM users WHERE id = :id`,
          { id: locals.user.id }
        )) as unknown as Array<{ password: string }[]>;

        const currentPasswordMatch = bcrypt.compareSync(
          currentPassword,
          currentPasswordRow[0]?.password
        );

        if (!currentPasswordMatch) {
          actionData.errors.currentPasswordIncorrect = true;
          throw new Error();
        }

        passwordCanBeChanged = true;
      } catch {}
    }

    anyErrors = Object.values(actionData.errors).some(
      (state) => state === true
    );

    if (!anyErrors) {
      const user = {
        id: locals.user.id,
        login,
        email,
        password: bcrypt.hashSync(newPassword, 10),
        name,
        super: locals.user.super,
      };

      try {
        const sql = `
          UPDATE users
          SET
            login = :login,
            ${passwordCanBeChanged ? "password = :password," : ""}
            email = :email,
            name = :name
          WHERE id = :id
        `;

        await mysql.beginTransaction();

        await mysql.execute(sql, user);

        await mysql.commit();

        locals.user = user;
        setSessionCookie(cookies, user);
      } catch (error) {
        await mysql.rollback();

        actionData.errors.general = true;
        anyErrors = true;

        console.error(error);
      }
    }

    actionData.success = !anyErrors;

    return actionData;
  },
} satisfies Actions;
