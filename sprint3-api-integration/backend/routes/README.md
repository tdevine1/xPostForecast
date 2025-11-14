# Sprint 2 Routes: Authentication Endpoints (`auth.js`)

The **`routes/`** folder contains the Express route handlers that define your backend API endpoints.  
In Sprint 2, the primary file is `auth.js`, which manages **user registration, login, session verification, and logout** using secure **HTTP-only cookies**.

---

## 📂 File Overview

```
routes/
└── auth.js
```

| Route | Method | Purpose |
|--------|---------|----------|
| `/auth/register` | **POST** | Register a new user with `email`, `username`, and `password`. |
| `/auth/login` | **POST** | Authenticate user credentials and issue a JWT in an HTTP-only cookie. |
| `/auth/test` | **GET** | Verify a user’s authentication status using the cookie’s JWT. |
| `/auth/logout` | **POST** | Clear the user’s cookie to log out securely. |

---

## ⚙️ Internal Dependencies

`auth.js` imports and uses the following:

```js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import authMiddleware from '../middleware/authMiddleware.js';
```

- **`express.Router()`** – modularizes route definitions.
- **`bcryptjs`** – securely hashes passwords before database insertion.
- **`jsonwebtoken`** – generates and validates session tokens.
- **`pool`** – handles MySQL connections.
- **`authMiddleware`** – used for protected routes like `/auth/test`.

---

## 🔐 Route Details

### `POST /auth/register`
Registers a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "newuser",
  "password": "securepassword"
}
```

**Process:**
1. Hashes password using `bcrypt.hash(password, 10)`.
2. Inserts into the `users` table.
3. Returns a `201 Created` with `{ "message": "User registered successfully" }`.

**Response Example:**
```json
{
  "message": "User registered successfully"
}
```

---

### `POST /auth/login`
Authenticates a user and sets a signed JWT cookie.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepassword"
}
```

**Process:**
1. Looks up the user by username.
2. Compares hash with `bcrypt.compare()`.
3. If valid, creates a JWT with `jsonwebtoken.sign()` and sets it as:
   ```js
   res.cookie('token', token, {
     httpOnly: true,
     sameSite: 'strict',
     secure: process.env.NODE_ENV === 'production'
   });
   ```
4. Returns `{ "message": "Login successful" }`.

---

### `GET /auth/test`
Validates the authentication cookie.

**Protected by:** `authMiddleware`

**Behavior:**
- Checks for a JWT in cookies.
- Verifies token.
- Responds with user info if valid:
  ```json
  { "ok": true, "user": { "id": 1, "username": "newuser" } }
  ```

---

### `POST /auth/logout`
Clears the authentication cookie.

**Behavior:**
```js
res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
res.json({ message: 'Logout successful' });
```

---

## 🧩 Example Flow (Frontend → Backend)

```text
[Register.jsx]  → POST /auth/register → DB Insert
[Login.jsx]     → POST /auth/login    → Cookie Set
[App.jsx]       → GET  /auth/test     → Session Verified
[MapPage.jsx]   → POST /auth/logout   → Cookie Cleared
```

---

## 🧠 Notes & Best Practices
- Always include `credentials: 'include'` (fetch) or `{ withCredentials: true }` (Axios) in frontend requests.
- Tokens are **not** stored in `localStorage` or `sessionStorage`.
- Use HTTPS + `secure: true` cookies in production.

---

## 📚 References
- Express Router: https://expressjs.com/en/guide/routing.html  
- bcryptjs: https://github.com/dcodeIO/bcrypt.js  
- jsonwebtoken: https://github.com/auth0/node-jsonwebtoken  
- MDN Cookies: https://developer.mozilla.org/docs/Web/HTTP/Cookies
