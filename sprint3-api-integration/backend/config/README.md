# Config README

## Purpose
The `config/` directory contains the database connection and SSL configuration used to connect securely to Azure MySQL.

## File: `database.js`
- Uses `mysql2/promise` for async/await support
- Loads SSL certificate (`DigiCertGlobalRootG2.crt.pem`)
- Reads environment variables for credentials

Example connection setup:
```js
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, 'DigiCertGlobalRootG2.crt.pem')),
    rejectUnauthorized: true
  }
});
```

## Expected Console Output
```
Loaded CA cert from: backend/config/DigiCertGlobalRootG2.crt.pem
Connecting to Azure MySQL...
Successfully connected to MySQL
```
