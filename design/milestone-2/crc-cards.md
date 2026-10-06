# CRC Cards: xPostForecast

One card per class. The PowerPoint version, [`crc-cards.pptx`](./crc-cards.pptx), has one card per slide. Classes come from the [grammatical parse](./grammatical-parse.md).

## Frontend

### App

*frontend/src/App.jsx*

Top-level component. Decides whether the user is logged in and which page to show for each URL.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| authenticated: whether the user is logged in | verifySession(): asks the server once, on page load, whether the session cookie is valid | ApiClient |
| checkingAuth: whether the session check is still running | chooseRoute(path): shows a page, or redirects (e.g. /map → /login when logged out) | LoginPage |
| the route table (/, /login, /register, /map) | setAuthenticated(value): lets pages report login and logout | RegisterPage |
|  |  | MapPage |

### ApiClient

*frontend/src/api.js*

The single, shared way the frontend talks to the backend.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| baseUrl: the backend's address (VITE_BACKEND_API_URL) | get(path): sends a GET request and returns the response | AuthController |
| withCredentials: always send the session cookie | post(path, body): sends a POST request and returns the response | TemperatureController |
|  | reports HTTP errors and "server unreachable" to the caller |  |

### LoginPage

*frontend/src/pages/Login.jsx*

Form where a registered user logs in.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| username: what the user typed | submitLogin(): sends the credentials to the server | ApiClient |
| password: what the user typed | on success, tells App the user is logged in and opens the map page | App |
|  | shows "Invalid credentials" or another error message |  |

### RegisterPage

*frontend/src/pages/Register.jsx*

Form where a visitor creates an account.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| email, username, password: what the visitor typed | checks that all three fields are filled in | ApiClient |
|  | submitRegistration(): sends them to the server |  |
|  | on success, opens the login page; otherwise shows the server's message |  |

### MapPage

*frontend/src/pages/MapPage.jsx*

Main page for logged-in users: choose a month, load its temperatures, show them on the map.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| date: the chosen month as YYYY-MM-01 | fetchTemperatureData(): requests the chosen month's points | DateSelector |
| temperatureData: the points to draw | showError(message): shows why data can't be displayed | TemperatureMap |
| isLoading: whether a request is running | backToLogin(): returns to the login page when the session has expired | ApiClient |
| errorMessage: the message to show, if any | logout(): ends the session, then returns to the login page | App |

### DateSelector

*frontend/src/components/DateSelector.jsx*

Month and year dropdowns with a Fetch Data button.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| month, year: the current choices | chooseMonth(), chooseYear(): update the choice | MapPage |
| firstYear = 1895, lastYear = 2022: the years the dataset covers | reportDate(): tells MapPage the date as YYYY-MM-01 once both are chosen |  |
|  | asks MapPage to fetch data when Fetch Data is clicked |  |

### TemperatureMap

*frontend/src/components/MapComponent.jsx*

Leaflet map of West Virginia that draws one colored circle per temperature point.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| center and zoom: where the map starts | drawPoints(points): draws a circle for each point | TemperaturePoint |
| colorScale: dark blue at −10 °F to dark red at 110 °F | colorFor(tavg): picks a point's color | OpenStreetMap tile server (external) |
| points: the temperatures to draw | showPopup(point): shows latitude, longitude, and °F when a circle is clicked |  |

## Backend

### AuthController

*backend/routes/auth.js*

Handles registration, login, session checks, and logout (the /auth routes).

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| minimum password length = 8 | register(email, username, password): validates input and creates the user | UserStore |
| session lifetime = 1 hour | hashPassword(password): makes a bcrypt hash | User |
| attemptLimit: 20 login/register attempts per address per 15 minutes | login(username, password): checks credentials and sets the session cookie | SessionToken |
|  | currentUser(): reports who is logged in (GET /auth/test) | AuthGuard |
|  | logout(): clears the session cookie |  |
|  | limitAttempts(request): refuses requests over the limit |  |

### AuthGuard

*backend/middleware/authMiddleware.js*

Checks the session before any protected route runs.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| the name of the session cookie (token) | requireLogin(request): lets the request continue with the user attached, or answers 401 | SessionToken |
|  |  | TemperatureController |
|  |  | AuthController |

### SessionToken

*jsonwebtoken + backend/config/cookies.js*

A signed token (JWT) that proves who is logged in. It travels only in an HTTP-only cookie.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| userId, username: who it belongs to | issue(user): creates and signs a token | AuthController |
| lifetime = 1 hour | verify(token): checks the signature and expiry and returns the user, or fails | AuthGuard |
| the signing secret (JWT_SECRET) | cookieOptions(): the flags for setting and clearing the cookie |  |
| cookie settings for development and production |  |  |

### User

*users table (backend/db/schema.sql)*

A registered account.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| id | checkPassword(password): compares a typed password with passwordHash | UserStore |
| email (unique) |  | AuthController |
| username (unique) |  |  |
| passwordHash (bcrypt, never the password) |  |  |
| createdAt |  |  |

### UserStore

*backend/config/database.js*

Saves and finds users in Azure Database for MySQL over an encrypted connection.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| connection settings (host, user, password, database, port) | insertUser(username, email, passwordHash): adds a user; reports a duplicate username or email | User |
| the CA certificate used to verify the server | findUserByUsername(username): returns the user, or nothing | Azure Database for MySQL (external) |
| the connection pool |  |  |

### TemperatureController

*backend/routes/stac.js (GET /temperature/:date)*

Answers requests for one month of West Virginia temperatures.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| cache: recently loaded months (up to 24) | getMonthlyTemperatures(date): validates the date, returns cached points or loads them | AuthGuard |
| the date format it accepts (YYYY-MM-DD) | answers 400 (bad date), 404 (no data for the month), or 502 (data service failed) | MonthLoader |
|  | remembers each loaded month and drops the oldest when full | TemperaturePoint |

### MonthLoader

*backend/routes/stac.js (loadMonth)*

Gets one month of NOAA nClimGrid temperatures from Microsoft Planetary Computer.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| the catalog search address | searchCatalog(month): finds the dataset item for the month | UrlSigner |
| collection = noaa-nclimgrid-monthly | loadMonth(month): searches, signs, downloads, and reads the grid, then returns points (or none) | TemperatureGrid |
| asset = tavg (average temperature) |  | Microsoft Planetary Computer (external) |
| boundingBox: West Virginia's west, south, east, north |  |  |

### UrlSigner

*backend/sign/sign.js*

Turns a Planetary Computer file address into one that can be downloaded.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| the signing service's address | sign(url): returns the address with a short-lived access token (SAS) added, or fails | MonthLoader |
|  |  | Microsoft Planetary Computer (external) |

### TemperatureGrid

*backend/routes/stac.js (readGrid, samplePoints)*

The block of grid cells covering West Virginia, read from one GeoTIFF file.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| values: the cell temperatures in °C, row by row | readWindow(file, boundingBox): reads only the cells inside the box | MonthLoader |
| width, height: size of the block | toPoints(boundingBox): turns each cell with data into a point at the cell's center (at most 10,000) | TemperaturePoint |
| west, north: its top-left corner |  |  |
| pixelWidth, pixelHeight: cell size in degrees |  |  |
| noData: the value meaning "no measurement" |  |  |

### TemperaturePoint

*objects returned by GET /temperature/:date*

One grid cell's location and average temperature, ready to draw.

| Responsibilities: knows | Responsibilities: does | Collaborators |
|---|---|---|
| lat, lon: the cell's center | fromCelsius(lat, lon, celsius): creates a point, converting °C to °F | TemperatureGrid |
| tavg: average temperature in °F |  | TemperatureMap |
