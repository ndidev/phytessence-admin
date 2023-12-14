import type { PageServerLoad, Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import {
  mysql,
  verifySessionCookie,
  setSessionCookie,
  deleteSessionCookie,
} from "$lib/server";

export const load = (async ({ cookies }) => {
  const user = verifySessionCookie(cookies);
  if (user) {
    redirect(302, "/");
  }

  return {};
}) satisfies PageServerLoad;

export const actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();

    const login = String(formData.get("login")) || "";
    const password = String(formData.get("password")) || "";

    // DB password
    const [userRow] = (await mysql.execute(
      `SELECT * from users WHERE email = :login`,
      { login }
    )) as unknown as Array<User[]>;

    const user = userRow[0];

    if (!user) {
      return {
        error: {
          message: "Utilisateur non trouvé",
        },
      };
    }

    const passwordHash = user.password || "";

    const passwordOK = await bcrypt.compare(password, passwordHash);

    if (!passwordOK) {
      return {
        error: {
          message: "Mot de passe erroné",
        },
      };
    }

    setSessionCookie(cookies, user);

    redirect(302, "/");
  },
  logout: async ({ cookies, locals }) => {
    deleteSessionCookie(cookies);
    locals.user = null;
    // la page est re-rendue => redirection vers /login avec hooks
  },
} satisfies Actions;
