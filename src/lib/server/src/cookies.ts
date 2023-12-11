import type { Cookies } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_EXPIRATION,
  JWT_SECRET,
} from "$env/static/private";

const PATH = "/";

/**
 * Vérifie un cookie de session.
 *
 * @return Infos utilisateur si OK, `false` sinon.
 */
export function verifySessionCookie(cookies: Cookies): User | null {
  let _user: User | null = null;

  const sessionCookie = cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  jwt.verify(sessionCookie, JWT_SECRET, (err, decoded) => {
    if (err) {
      return;
    }

    const user = (decoded as jwt.JwtPayload).user as User;

    _user = user;

    // Prolonger la durée du cookie
    setSessionCookie(cookies, user);
  });

  return _user;
}

/**
 * Enregistre un cookie de session.
 */
export function setSessionCookie(cookies: Cookies, user: User) {
  const now = Math.floor(Date.now() / 1000);
  const cookieExpiration = now + parseInt(SESSION_COOKIE_EXPIRATION);

  delete user.password;

  const sessionJWT = {
    iss: "phytadmin",
    iat: now,
    exp: cookieExpiration,
    user,
  };

  cookies.set(SESSION_COOKIE_NAME, jwt.sign(sessionJWT, JWT_SECRET), {
    maxAge: parseInt(SESSION_COOKIE_EXPIRATION),
    path: PATH,
  });
}

export function deleteSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE_NAME, { path: PATH });
}
