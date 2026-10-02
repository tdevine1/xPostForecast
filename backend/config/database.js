/**
 * config/database.js
 *
 * Creates the MySQL connection pool used by every route.
 * The connection to Azure Database for MySQL is encrypted (TLS) and the
 * server's certificate is verified against the bundled CA certificate.
 */
import mysql from 'mysql2/promise';
import fs from 'node:fs';

// Root CA certificate for Azure Database for MySQL, read once at startup
const caCert = fs.readFileSync(new URL('./DigiCertGlobalRootG2.crt.pem', import.meta.url));

const port = Number(process.env.DB_PORT) || 3306;
console.log(`Connecting to MySQL at ${process.env.DB_HOST}:${port}`);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: caCert,               // trust Azure's certificate chain
    rejectUnauthorized: true, // refuse the connection if the certificate doesn't verify
  },
});

// Try one connection at startup so database problems show up in the logs immediately
pool.getConnection()
  .then((conn) => {
    console.log('Successfully connected to MySQL');
    conn.release();
  })
  .catch((err) => {
    console.error('MySQL connection failed on startup:', err.message);
  });

export default pool;
