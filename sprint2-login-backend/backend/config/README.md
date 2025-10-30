# backend/config — Configuration

Contains configuration for database and TLS.

- `database.js` — Creates a MySQL connection pool using `mysql2/promise`. Reads env vars, enables SSL with DigiCertGlobalRootG2 cert.
- `DigiCertGlobalRootG2.crt.pem` — Azure’s public root certificate for TLS.

**Best practices**
- Never disable TLS verification in production.
- Ensure file paths match between code and filesystem.
