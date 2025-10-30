# Sprint 2 Backend — xPostForecast Authentication API

This backend provides user authentication and connects to **Azure Database for MySQL (Flexible Server)** over TLS.
Use this README instead of older guides. It reflects the current repo structure (ESM + `mysql2/promise`, Vite frontend, port **5175**, DigiCert Global Root **G2**).

---

## Prerequisites
- Node.js **20.19+**
- VS Code with the **MySQL** extension
- Azure **MySQL Flexible Server** (your public IP allowed in *Networking → Firewall rules*)
- Repo cloned locally

---

## Setup Summary
1. **Install dependencies**
   ```bash
   cd sprint2-login-backend/backend
   npm install
   ```
2. **Create .env**
   ```ini
   DB_HOST=<your-azure-host>.mysql.database.azure.com
   DB_USER=<your-admin-username>
   DB_PASSWORD=<your-password>
   DB_NAME=authdb
   DB_PORT=3306
   BACKEND_PORT=5175
   JWT_SECRET=<run the node crypto command>
   FRONTEND_URL=http://localhost:5173
   ```
3. **Generate JWT secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. **Download SSL certificate**
   Azure Portal → MySQL server → *Networking → Download SSL certificate*  
   Move to `backend/config/DigiCertGlobalRootG2.crt.pem`
5. **Create database**
   ```sql
   CREATE DATABASE authdb;
   USE authdb;
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(50) NOT NULL UNIQUE,
     email VARCHAR(100) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

---

## Running Locally
```bash
cd sprint2-login-backend/backend
node app.js
```
**Expected output**
```
Successfully connected to MySQL
Server is running on 5175
```

Visit [http://localhost:5175/auth/test](http://localhost:5175/auth/test)

---

## Understanding CORS
CORS (Cross‑Origin Resource Sharing) allows your frontend (`localhost:5173`) to communicate with the backend (`localhost:5175`).  
This backend uses:
```js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```
More info: [MDN CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS)

---

## Troubleshooting
| Issue | Fix |
|:--|:--|
| SSL error | Ensure DigiCertGlobalRootG2.crt.pem path is correct |
| Access denied | Whitelist your IP in Azure Networking |
| CORS blocked | Check FRONTEND_URL in .env |
| Port conflict | Change BACKEND_PORT and VITE_API_URL |
