import mysql from "mysql2/promise";

import {
  DATABASE_URL, // PlanetScale
  MARIADB_HOST,
  MARIADB_PORT,
  MARIADB_PASS,
  MARIADB_USER,
  MARIADB_BASE,
} from "$env/static/private";

const connectionUri = DATABASE_URL
  ? {
      uri: DATABASE_URL,
    }
  : ({
      host: MARIADB_HOST,
      port: parseInt(MARIADB_PORT),
      user: MARIADB_USER,
      password: MARIADB_PASS,
      database: MARIADB_BASE,
    } satisfies mysql.ConnectionOptions);

const options = {
  dateStrings: true,
  namedPlaceholders: true,
  multipleStatements: true,
} satisfies mysql.ConnectionOptions;

const config = { ...connectionUri, ...options };

const connection = await mysql.createConnection(config);

connection.on("error", (err) => {
  console.error("Erreur");
  console.error(err);
});

export { connection };
