# sign/ Directory Documentation

This directory contains:

## 1. `sign.js`

A helper module for signing Microsoft Planetary Computer asset URLs using SAS tokens.

Workflow:
- Takes raw `href` of a COG asset  
- Calls Planetary Computer’s `/sas/v1/sign` endpoint  
- Returns a **signed URL** usable by `fetch()`  

**Purpose**
- Authorize secure access to COG temperature grids  
- Integrate seamlessly with the backend’s STAC search  
- Prevent direct exposure of secret keys on frontend

**References**
- SAS signing API:  
  https://planetarycomputer.microsoft.com/docs/concepts/sas
