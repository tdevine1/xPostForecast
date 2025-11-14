# config/ Directory Documentation

This directory contains configuration utilities for the **backend API** of xPostForecast.

## Contents

### 1. `database.js`
Responsible for establishing a **secure MySQL connection pool** using:
- `mysql2/promise` – modern async/await database driver  
- TLS/SSL encryption using the DigiCert root CA  
- Environment variables for credentials

Includes:
- Structured pool creation  
- SSL certificate loading  
- Initial connection test for debugging

**Techniques Used**
- SSL-based database authentication  
- Connection pooling for efficient query handling  
- Dynamic environment variable loading

### 2. `DigiCertGlobalRootG2.crt.pem`
Root certificate required for Azure Database for MySQL.

**Reference**
- Azure MySQL SSL Requirements:  
  https://learn.microsoft.com/azure/mysql/single-server/how-to-configure-ssl

---

This directory ensures **secure, encrypted database communication** between Node.js and Azure Database for MySQL.
