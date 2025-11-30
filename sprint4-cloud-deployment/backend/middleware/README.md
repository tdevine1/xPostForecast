# middleware/ Directory Documentation

The middleware directory holds shared Express middleware used by all backend routes.

## 1. `authMiddleware.js`
A JWT authentication guard that:
- Reads the JWT from the HTTP-only cookie  
- Verifies it with the backend’s `JWT_SECRET`  
- Attaches decoded user info to `req.user`  
- Returns `401` or `403` for unauthorized access

**Tools & Techniques**
- JSON Web Tokens (JWT)  
- Cookie-based authentication  
- Stateless, middleware-controlled route security  
- Error-first Express flow control  

**References**
- JWT Official Standard: https://jwt.io/introduction  
- Express Middleware Guide: https://expressjs.com/en/guide/using-middleware.html
