# `config/`

Configuration the rest of the backend imports.

| File | Purpose |
|---|---|
| `env.js` | Loads `backend/.env` into `process.env` with Node's built-in `process.loadEnvFile()`. Imported first by `server.js`. If there is no `.env` (as on Azure), it does nothing. |
| `database.js` | Creates the `mysql2/promise` connection pool from the `DB_*` variables, with TLS verified against the CA certificate. Tries one connection at startup and logs the result. |
| `cookies.js` | `authCookieOptions()`: the auth cookie's flags. Development: `HttpOnly; SameSite=Lax`. Production: `HttpOnly; Secure; SameSite=None; Partitioned`. |
| `DigiCertGlobalRootG2.crt.pem` | CA certificate for Azure Database for MySQL, downloaded from the Azure Portal (**Networking → Download SSL Certificate**). It is public, not a secret. |

The pool's TLS settings:

```js
ssl: {
  ca: caCert,               // trust Azure's certificate chain
  rejectUnauthorized: true, // refuse the connection if the certificate doesn't verify
}
```

Expected console output at startup:

```text
Connecting to MySQL at <your-server>.mysql.database.azure.com:3306
Successfully connected to MySQL
```

`DB_PORT` defaults to `3306` if it isn't set.
