import { redirect, type Handle } from "@sveltejs/kit";
import { verifySessionCookie } from "$lib/server";

export const handle = (async ({ event, resolve }) => {
  if (event.route.id?.startsWith("/(public)")) {
    return resolve(event);
  }

  const user = verifySessionCookie(event.cookies);

  if (!user) {
    throw redirect(302, "/login");
  }

  event.locals.user = user;

  return resolve(event);
}) satisfies Handle;
