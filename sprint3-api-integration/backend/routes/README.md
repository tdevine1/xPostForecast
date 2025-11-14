# routes/ Directory Documentation

This directory contains all backend route definitions.

---

## 1. `auth.js`
Responsible for:
- User registration  
- Login  
- Logout  
- Session validation (`/auth/test`)

Uses:
- `bcrypt` for password hashing  
- `jwt` for token signing  
- MySQL queries for user persistence  

**Concepts**
- Secure password hashing  
- Stateful session via HTTP-only cookie  
- REST API structure and error handling  

---

## 2. `stac.js`
Handles temperature data retrieval via **Microsoft Planetary Computer**.

Process:
1. Build STAC search query  
2. Retrieve monthly NOAA nClimGrid COG  
3. Use SAS signing endpoint to authorize asset access  
4. Load raster using `georaster`  
5. Convert Celsius → Fahrenheit  
6. Return array of `{ lat, lon, tavg }`

**Tools**
- `node-fetch`  
- `georaster`
- Microsoft STAC API  
- Signed SAS URLs  

**References**
- STAC Specification: https://stacspec.org  
- Microsoft Planetary Computer: https://planetarycomputer.microsoft.com/docs  
- COG Overview: https://www.cogeo.org
