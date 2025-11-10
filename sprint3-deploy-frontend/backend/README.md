# Sprint 2 Backend: Setup & Database Integration Guide

In **Sprint 2**, you build your first backend: an Express.js server that handles user authentication and connects securely to an **Azure MySQL** database over **TLS/SSL**. This guide reflects the **current repo** (ESM modules, `mysql2/promise`, **cookie‑based JWT auth**, and **email on registration**).

> This README applies to the `sprint2-login-backend/backend` folder.

---

## 🖼️ Visual Overview

> If screenshots aren’t showing, make sure these images exist in your repo (suggested paths):
>
> - `docs/img/sprint2-backend-architecture.png`
> - `docs/img/azure-networking-firewall.png`
> - `docs/img/azure-download-ssl.png`
> - `docs/img/vscode-mysql-connection.png`

![Architecture](docs/img/sprint2-backend-architecture.png)
*High‑level flow: React (Vite) ⇄ Cookie‑based auth ⇄ Express ⇄ Azure MySQL (TLS)*

---

## 📂 Backend Folder Structure

```bash
backend/
├── config/
│   ├── database.js                      # MySQL pool + SSL setup
│   └── DigiCertGlobalRootG2.crt.pem     # SSL certificate from Azure
├── middleware/
│   └── authMiddleware.js                # JWT cookie verification
├── routes/
│   └── auth.js                          # /auth routes: register, login, test, logout
├── server.js                            # app entry (CORS, cookies, routes)
└── .env.example                         # sample env vars
```

---

## 🛠 Prerequisites

- **Node.js** 20.19+
- **VS Code** (MySQL extension by Microsoft or SQLTools + MySQL driver)
- **Azure Database for MySQL – Flexible Server**
- Your public IP allowed in **Azure → Networking → Firewall rules**

![Allow Client IP](docs/img/azure-networking-firewall.png)

---

## 1) Clone & Install

```bash
cd sprint2-login-backend/backend
npm install
```

---

## 2) Configure Environment Variables

1) Copy sample and edit:
```bash
cp .env.example .env
```

2) Edit `.env` with your Azure MySQL details and frontend/backend settings:

```ini
DB_HOST=<your-server>.mysql.database.azure.com
DB_USER=<your-admin-user>
DB_PASSWORD=<your-password>
DB_NAME=authdb
DB_PORT=3306

FRONTEND_URL=http://localhost:5173
BACKEND_PORT=5175

JWT_SECRET=<run the node crypto command to generate>
NODE_ENV=development
```

> **Do not commit** `.env` (already in `.gitignore`).

**Generate a JWT secret** (one‑liner):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3) Download the SSL Certificate from Azure

Use the certificate provided **by Azure** (not directly from DigiCert).

1. Go to the **Azure Portal** → your **MySQL Flexible Server**
2. Open **Networking**
3. Click **Download SSL Certificate**

![Download SSL](docs/img/azure-download-ssl.png)

Move/rename it to your project:

```bash
# Example
mv ~/Downloads/DigiCertGlobalRootG2.crt.pem sprint2-login-backend/backend/config/DigiCertGlobalRootG2.crt.pem
```

> The backend reads this CA file to validate TLS to Azure.

---

## 4) Connect with VS Code

You can validate connectivity and run SQL using VS Code’s MySQL extension (or SQLTools). Since you haven't created the authdb database yet, you should first login to the mysql database, which is created automatically. Then you can create the authdb database and users table, as well as any other dbs and tables you need for storing persistent information.

- **Host**: `<your-server>.mysql.database.azure.com`
- **Port**: `3306`
- **Database**: `mysql`
- **User**: your admin user
- **Password**: your password
- **SSL**: enabled; CA file: `backend/config/DigiCertGlobalRootG2.crt.pem`

![VS Code MySQL Connection](docs/img/vscode-mysql-connection.png)

---

## 5) Create the `users` Table (with email)

Run this SQL in your Azure DB (VS Code or CLI):

```sql
CREATE DATABASE IF NOT EXISTS authdb;
USE authdb;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> Registration requires **email + username + password**.

---

## 6) Run the Backend

```bash
# From backend/ directory
node server.js
```

**Expected output:**
```
Configured FRONTEND_URL= http://localhost:5173
Successfully connected to MySQL
Server is running on 5175
```

---

## 7) Test the Auth Routes

All routes are mounted under `/auth`:

- **Register** `POST /auth/register` → `{ email, username, password }`
- **Login** `POST /auth/login` → sets HTTP‑only cookie
- **Verify** `GET /auth/test` → returns `{ ok: true, user }` if cookie valid
- **Logout** `POST /auth/logout` → clears cookie

**Curl examples (dev only):**

```bash
# Register
curl -i -X POST http://localhost:5175/auth/register \
  -H "Content-Type: application/json" \
  --data '{"email":"a@b.com","username":"alice","password":"pass123"}'

# Login
curl -i -X POST http://localhost:5175/auth/login \
  -H "Content-Type: application/json" \
  --data '{"username":"alice","password":"pass123"}' \
  -c cookies.txt

# Test (uses cookie)
curl -i http://localhost:5175/auth/test -b cookies.txt

# Logout
curl -i -X POST http://localhost:5175/auth/logout -b cookies.txt
```

---

## 🔐 CORS & Cookies (Important)

Enable CORS with **credentials** and parse cookies:

```js
// server.js
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);
```

In React (frontend), always include credentials for protected calls:

```js
axios.get(`${VITE_API_URL}/auth/test`, { withCredentials: true });
```

---

## 🧭 Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `403 /auth/test` on first load | No cookie yet | This is normal before login |
| `404 /login` | Missing `/auth` prefix | Use `/auth/login` and `/auth/register` |
| CORS error / cookie not set | Missing `credentials: true` or wrong `FRONTEND_URL` | Set both on server and client |
| `ER_NO_DEFAULT_FOR_FIELD 'email'` | Table requires email but request didn’t send it | Add email to frontend + INSERT |
| SSL errors | Wrong CA path | Ensure `config/DigiCertGlobalRootG2.crt.pem` path |

---

## 📚 References

- Express: https://expressjs.com/
- mysql2: https://github.com/sidorares/node-mysql2
- jsonwebtoken: https://github.com/auth0/node-jsonwebtoken
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- MDN CORS: https://developer.mozilla.org/docs/Web/HTTP/CORS
