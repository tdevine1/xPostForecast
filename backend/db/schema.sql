-- Database schema for xPostForecast (Sprint 2 onward).
-- Run once against your Azure Database for MySQL server, from the backend/ folder:
--   mysql -h <your-server>.mysql.database.azure.com -u <your-admin-user> -p --ssl-ca=config/DigiCertGlobalRootG2.crt.pem < db/schema.sql

CREATE DATABASE IF NOT EXISTS authdb;
USE authdb;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,   -- bcrypt hash, never the plaintext password
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
