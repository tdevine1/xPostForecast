# pages/ Directory Documentation

This directory contains full-screen application pages.

---

## 1. `Login.jsx`
Provides:
- Username/password login form  
- Requests `/auth/login` using Axios instance  
- Stores authenticated state  

Security:
- Depends on HTTP-only cookies  
- Backend validates sessions  

---

## 2. `Register.jsx`
Provides new-user onboarding.

- Sends POST to `/auth/register`  
- Performs minimal form validation  
- Redirects upon success  

---

## 3. `MapPage.jsx`
Main application view.

Handles:
- Date selection UI  
- Fetching STAC-derived temperature data  
- Sending Axios requests with credentials  
- Displaying loading spinner  
- Rendering map overlay  

Workflow:
1. User selects date  
2. Clicks "Fetch"  
3. Axios → backend `/stac` route  
4. Backend returns array of `{ lat, lon, tavg }`  
5. MapComponent renders markers  

**References**
- React Router: https://reactrouter.com  
- Axios with Credentials:  
  https://axios-http.com/docs/config_defaults
