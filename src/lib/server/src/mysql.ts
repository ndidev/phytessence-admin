import mysql from "mysql2/promise";

import {
  DATABASE_URL, // PlanetScale
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_PASS,
  MYSQL_USER,
  MYSQL_BASE,
} from "$env/static/private";

const connectionUri = DATABASE_URL
  ? {
      uri: DATABASE_URL,
    }
  : ({
      host: MYSQL_HOST,
      port: parseInt(MYSQL_PORT),
      user: MYSQL_USER,
      password: MYSQL_PASS,
      database: MYSQL_BASE,
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
