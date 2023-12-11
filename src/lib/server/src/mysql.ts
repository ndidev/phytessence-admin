import mysql from "mysql2/promise";

import {
  DATABASE_URL, // PlanetScale
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_PASS,
  MYSQL_USER,
  MYSQL_BASE,
} from "$env/static/private";

const connectionUri = {
  uri: DATABASE_URL,
  dateStrings: true,
} satisfies mysql.ConnectionOptions;

const connectionOptions = {
  host: MYSQL_HOST,
  port: parseInt(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASS,
  database: MYSQL_BASE,
  dateStrings: true,
  namedPlaceholders: true,
} satisfies mysql.ConnectionOptions;

const connection = DATABASE_URL
  ? await mysql.createConnection(connectionUri)
  : await mysql.createConnection(connectionOptions);

connection.on("error", (err) => {
  console.log("Erreur");
  console.log(err);
});

export { connection };
