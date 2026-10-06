# Milestone 4: Component Pseudocode

The PDFs in this folder are the deliverables; this page repeats their text for reading on GitHub.

## Component 1: User Registration

*Backend: POST /auth/register (backend/routes/auth.js) · user stories US-1*

Files: [`Component1_Registration_Pseudocode.pdf`](./Component1_Registration_Pseudocode.pdf) · [`Component1_Registration_Flowchart.pdf`](./Component1_Registration_Flowchart.pdf)

Creates a new account from an email address, a username, and a password, after checking the input. Only a bcrypt hash of the password is ever stored.

**Design principles**

- **Information hiding.** The plaintext password is hidden inside this component: it is hashed immediately, and only the hash is passed on to the users table. No other part of the system can see or leak the original password. The database details (connection settings, SQL) are likewise hidden behind UserStore, so this component only asks to insert a user.
- **Separation of concerns.** Rate limiting is a separate concern handled by its own module (express-rate-limit) that runs before the registration logic, and duplicate detection is left to the database's UNIQUE constraints. The component's own code deals only with validating input and creating the account.

```text
BEGIN RegisterUser
    IF this address has made more than 20 attempts in the last 15 minutes THEN
        RESPOND 429 "Too many attempts. Please wait 15 minutes and try again."
        STOP
    END IF

    READ email, username, password FROM the request body

    IF email, username, or password is missing THEN
        RESPOND 400 "email, username, and password are required"
        STOP
    END IF

    IF the length of password is less than 8 THEN
        RESPOND 400 "Password must be at least 8 characters"
        STOP
    END IF

    SET passwordHash TO the bcrypt hash of password (work factor 10)
    INSERT username, email, passwordHash INTO the users table

    IF the insert failed THEN
        IF the failure was a duplicate username or email THEN
            RESPOND 409 "That username or email is already registered"
        ELSE
            LOG the error
            RESPOND 500 "Failed to register user"
        END IF
        STOP
    END IF

    RESPOND 201 "User registered successfully"
END RegisterUser
```

## Component 2: User Login

*Backend: POST /auth/login (backend/routes/auth.js) · user stories US-2, US-3*

Files: [`Component2_Login_Pseudocode.pdf`](./Component2_Login_Pseudocode.pdf) · [`Component2_Login_Flowchart.pdf`](./Component2_Login_Flowchart.pdf)

Checks a username and password and, if they match, starts a one-hour session by setting a signed token in an HTTP-only cookie.

**Design principles**

- **Information hiding.** The component reveals as little as possible. An unknown username and a wrong password produce the same 401 "Invalid credentials" response, so callers can't discover which usernames exist. The session token is sent only in an HTTP-only cookie, never in the response body, so page scripts can't read it.
- **Functional independence (high cohesion, low coupling).** The cookie settings are chosen in one small, single-purpose module (config/cookies.js) that both login and logout use. Login depends only on that module's answer, not on how production and development differ, so the cookie policy can change without touching the login logic.

```text
BEGIN LoginUser
    IF this address has made more than 20 attempts in the last 15 minutes THEN
        RESPOND 429 "Too many attempts. Please wait 15 minutes and try again."
        STOP
    END IF

    READ username, password FROM the request body

    IF username or password is missing THEN
        RESPOND 400 "username and password are required"
        STOP
    END IF

    LOOK UP the user whose username matches (id, username, passwordHash)

    IF the lookup failed THEN
        LOG the error
        RESPOND 500 "Failed to login"
        STOP
    END IF

    IF no user was found THEN
        RESPOND 401 "Invalid credentials"
        STOP
    END IF

    IF password does not match the user's passwordHash (bcrypt compare) THEN
        RESPOND 401 "Invalid credentials"
        STOP
    END IF

    SET token TO a JWT holding the user's id and username,
        signed with JWT_SECRET and expiring in 1 hour

    IF the server is running in production THEN
        SET cookieFlags TO HttpOnly, Secure, SameSite=None, Partitioned
    ELSE
        SET cookieFlags TO HttpOnly, SameSite=Lax
    END IF

    SET the cookie "token" TO token WITH cookieFlags, lasting 1 hour
    RESPOND 200 "Login successful"
END LoginUser
```

## Component 3: Monthly Temperature Request

*Backend: GET /temperature/:date (backend/middleware/authMiddleware.js, backend/routes/stac.js) · user stories US-3, US-6, US-8*

Files: [`Component3_MonthlyTemperatureRequest_Pseudocode.pdf`](./Component3_MonthlyTemperatureRequest_Pseudocode.pdf) · [`Component3_MonthlyTemperatureRequest_Flowchart.pdf`](./Component3_MonthlyTemperatureRequest_Flowchart.pdf)

Answers a logged-in user's request for one month of West Virginia temperatures: checks the session, validates the date, and returns the month's points from the cache or from Component 4.

**Design principles**

- **Separation of concerns.** Checking the session is a cross-cutting concern, so it lives in its own module, AuthGuard, which runs before the request handler. The temperature logic never deals with cookies or tokens, and the same guard can protect any future route.
- **Modularity.** Fetching data from the outside service is a separate module, LoadMonth (Component 4), shown in the flowchart as a predefined process. This component only decides what to do with LoadMonth's three possible outcomes (points, no data, or failure), which keeps each module small enough to understand and test on its own.

```text
BEGIN GetMonthlyTemperatures
    READ token FROM the "token" cookie

    IF token is missing THEN
        RESPOND 401 "Not logged in"
        STOP
    END IF

    IF the token's signature is invalid OR the token has expired THEN
        RESPOND 401 "Invalid or expired session"
        STOP
    END IF

    READ date FROM the request path

    IF date is not in the form YYYY-MM-DD with a month from 01 to 12 THEN
        RESPOND 400 "Date must be YYYY-MM-DD"
        STOP
    END IF

    SET month TO the year and month of date (YYYY-MM)

    IF the cache contains month THEN
        RESPOND 200 WITH the cached points
        STOP
    END IF

    CALL LoadMonth(month), GIVING points          (Component 4)

    IF LoadMonth failed THEN
        LOG the error
        RESPOND 502 "The temperature data service is unavailable. Try again later."
        STOP
    END IF

    IF points is NONE THEN
        RESPOND 404 "No temperature data is available for <month>"
        STOP
    END IF

    STORE points IN the cache under month

    IF the cache holds more than 24 months THEN
        REMOVE the oldest month from the cache
    END IF

    RESPOND 200 WITH points
END GetMonthlyTemperatures
```

## Component 4: Load Month

*Backend: loadMonth, readGrid, samplePoints (backend/routes/stac.js, backend/sign/sign.js) · user stories US-6, US-7, US-8*

Files: [`Component4_LoadMonth_Pseudocode.pdf`](./Component4_LoadMonth_Pseudocode.pdf) · [`Component4_LoadMonth_Flowchart.pdf`](./Component4_LoadMonth_Flowchart.pdf)

Gets one month of NOAA nClimGrid average temperatures from Microsoft Planetary Computer and turns the grid cells inside West Virginia into map points. Returns the points, NONE if the month isn't in the dataset, or fails if the outside service has a problem.

**Design principles**

- **Abstraction and stepwise refinement.** To its caller, LoadMonth is one abstract step: "get this month's points." Inside, that step is refined into smaller ones (search the catalog, sign the file address, download, read the West Virginia window, convert each cell), and the signing step is refined again into its own module, UrlSigner.
- **Information hiding.** Everything specific to Planetary Computer (catalog address, collection name, the "tavg" asset, access tokens, the GeoTIFF file format) is hidden inside this component. If the data source changed, only this component would change; Component 3 and the frontend would not.

```text
BEGIN LoadMonth(month)          returns points, NONE, or FAILS
    SEARCH the Planetary Computer catalog for collection noaa-nclimgrid-monthly,
        inside West Virginia's bounding box, at the 15th of month

    IF the search request failed THEN
        FAIL "catalog search failed"
    END IF

    IF the search found no item THEN
        RETURN NONE
    END IF

    SET asset TO the item's "tavg" (average temperature) asset

    IF the item has no "tavg" asset THEN
        FAIL "item has no tavg asset"
    END IF

    CALL Sign(asset address), GIVING signedAddress

    IF signing failed THEN
        FAIL "signing failed"
    END IF

    DOWNLOAD the file at signedAddress

    IF the download failed THEN
        FAIL "download failed"
    END IF

    READ the cell values (°C) for the rows and columns that cover the bounding box
    SET points TO an empty list

    FOR EACH cell in the window, row by row
        IF the cell's value is a no-data value THEN
            SKIP to the next cell
        END IF

        SET lon, lat TO the center of the cell

        IF (lon, lat) is outside the bounding box THEN
            SKIP to the next cell
        END IF

        ADD a point (lat, lon, tavg = value × 9 / 5 + 32) TO points

        IF points holds 10,000 points THEN
            RETURN points
        END IF
    END FOR

    RETURN points
END LoadMonth
```
