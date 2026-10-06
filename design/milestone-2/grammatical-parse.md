# Grammatical Parse: xPostForecast

A grammatical parse finds candidate classes and operations in the requirements. **Nouns** suggest classes, attributes, actors, or external entities. **Verbs** suggest operations (methods) and the classes responsible for them. Each candidate is then kept, merged, or rejected.

Source: the user stories in [`../user-stories.md`](../user-stories.md) (US-1 to US-8).

## Step 1: Mark up the stories

**Bold** = noun · *italics* = verb

- **US-1** As a **visitor**, I want to *create* an **account** with my **email address**, a **username**, and a **password** so that I can *use* the **temperature map**. The **password** is never *stored* as typed; only a secure **hash** of it is *saved*. A **username** or **email address** that is already *registered* *shows* a **message**. After *registering*, the **visitor** is *taken* to the **login page**.
- **US-2** As a **registered user**, I want to *log in* with my **username** and **password** so that I can *reach* the **temperature map**. Wrong **credentials** *show* the same **message**. After 20 **attempts** from the same **address** within 15 **minutes**, further **attempts** are *refused*.
- **US-3** As a **registered user**, I want my **session** to *continue* when I *refresh* the **page** or *reopen* the **tab**. A **session** *lasts* one **hour**; after that, the next **data request** *sends* the **user** back to the **login page**. **Visitors** who *open* the **map page** without *logging in* are *sent* to the **login page**.
- **US-4** As a **registered user**, I want to *log out* so that nobody else using this **computer** can *use* my **session**. *Logging out* *ends* the **session** and *returns* the **user** to the **login page**, even if the **server** can't be *reached*.
- **US-5** As a **registered user**, I want to *choose* a **month** and a **year**. The **years** *offered* run from 1895 to 2022, the **years** the NOAA **dataset** *covers*. Clicking **Fetch Data** before *choosing* both *shows* a **message**.
- **US-6** As a **registered user**, I want to *see* the average **temperature** for the chosen **month** *drawn* across **West Virginia**. The **map** *shows* one colored **point** for each **cell** of NOAA's nClimGrid **grid** inside West Virginia's **bounding box**. **Colors** *run* from dark blue to dark red. A **spinner** *shows* while the **data** *loads*; *asking* for the same **month** again is nearly instant.
- **US-7** As a **registered user**, I want to *click* a **point** and *see* its **latitude**, **longitude**, and average **temperature**.
- **US-8** As a **registered user**, I want a clear **message** when **temperatures** can't be *shown*: for a **month** the **dataset** doesn't *include*, when the outside **data service** is *unavailable*, and when the app's own **server** can't be *reached*.

## Step 2: Classify the nouns

| Noun | Stories | Classification | Becomes |
|---|---|---|---|
| visitor | US-1, US-3 | Actor | Actor on the user story diagram (not a class) |
| registered user | US-2 to US-8 | Actor, and the stored record of one | Actor on the diagram; the stored record is the **User** class |
| account | US-1 | Synonym of the stored user | Merged into **User** |
| email address | US-1 | Attribute | `User.email` |
| username | US-1, US-2 | Attribute | `User.username` |
| password | US-1, US-2 | Input only (never stored) | Parameter of `AuthController.register()` / `login()` |
| hash | US-1 | Attribute | `User.passwordHash` |
| credentials | US-2 | Synonym (username + password) | Parameters of `AuthController.login()` |
| attempts, address, minutes | US-2 | Attributes of a policy | `AuthController.attemptLimit` (20 per address per 15 minutes) |
| session | US-3, US-4 | Class | **SessionToken** |
| hour | US-3 | Attribute | `SessionToken.lifetime` (1 hour) |
| login page | US-1 to US-4 | Class (UI) | **LoginPage** |
| (registration page) | US-1 | Class (UI), implied by "register" | **RegisterPage** |
| map page | US-3 | Class (UI) | **MapPage** |
| temperature map, map | US-1, US-2, US-6 | Class (UI) | **TemperatureMap** |
| page, tab | US-3 | Browser concepts | Rejected: outside the system |
| data request | US-3 | Class (shared request sender) | **ApiClient** |
| server | US-4, US-8 | The backend as a whole | Rejected as a single class: split into **AuthController** and **TemperatureController** |
| computer | US-4 | Outside the system | Rejected |
| month, year | US-5, US-6 | Attributes | `DateSelector.month`, `DateSelector.year`; `MapPage.date` |
| years offered (1895–2022) | US-5 | Attributes | `DateSelector.firstYear`, `DateSelector.lastYear` |
| Fetch Data | US-5 | UI control | Event handled by **DateSelector** |
| message | US-1, US-2, US-5, US-8 | Attribute | `MapPage.errorMessage`; error text in **LoginPage** / **RegisterPage** alerts |
| dataset, NOAA nClimGrid | US-5, US-8 | External data | Data provided by the external entity **Microsoft Planetary Computer** |
| data service | US-8 | External entity | **Microsoft Planetary Computer** (user story diagram) |
| temperature | US-6, US-7, US-8 | Attribute | `TemperaturePoint.tavg` (°F) |
| West Virginia, bounding box | US-6 | Attribute | `MonthLoader.boundingBox` |
| grid, cell | US-6 | Class | **TemperatureGrid** (a cell is one of its values) |
| point | US-6, US-7 | Class | **TemperaturePoint** |
| latitude, longitude | US-7 | Attributes | `TemperaturePoint.lat`, `TemperaturePoint.lon` |
| colors | US-6 | Attribute | `TemperatureMap.colorScale` |
| spinner | US-6 | Attribute (UI state) | `MapPage.isLoading` |
| data | US-6 | Synonym of points | Merged into **TemperaturePoint** |
| (where accounts are stored) | US-1, US-2 | External entity, implied by "stored" and "already registered" | **Azure Database for MySQL** (user story diagram), reached through **UserStore** |
| (the base map under the points) | US-6 | External entity, implied by "drawn across West Virginia" | **OpenStreetMap tile server** (user story diagram), used by **TemperatureMap** |

## Step 3: Assign the verbs

| Verb phrase | Stories | Becomes the operation | On class |
|---|---|---|---|
| create an account / register | US-1 | `submitRegistration()` | RegisterPage |
| | | `register(email, username, password)` | AuthController |
| store / save (a hash, never the password) | US-1 | `hashPassword(password)` | AuthController |
| | | `insertUser(username, email, passwordHash)` | UserStore |
| is already registered | US-1 | `insertUser()` reports a duplicate | UserStore |
| log in | US-2 | `submitLogin()` | LoginPage |
| | | `login(username, password)` | AuthController |
| check credentials | US-2 | `findUserByUsername(username)` | UserStore |
| | | `checkPassword(password)` | User |
| refuse further attempts | US-2 | `limitAttempts(request)` | AuthController |
| continue a session / refresh | US-3 | `verifySession()` | App |
| | | `issue(user)`, `verify(token)` | SessionToken |
| send to the login page (not logged in) | US-3 | `requireLogin(request)` | AuthGuard |
| | | `chooseRoute(path)` | App |
| log out / end the session | US-4 | `logout()` | MapPage |
| | | `logout()` (clears the cookie) | AuthController |
| choose a month and year | US-5 | `chooseMonth()`, `chooseYear()`, `reportDate()` | DateSelector |
| fetch / see temperatures | US-6 | `fetchTemperatureData()` | MapPage |
| | | `getMonthlyTemperatures(date)` | TemperatureController |
| load the data | US-6 | `loadMonth(month)` | MonthLoader |
| (access the outside data) | US-6 | `sign(url)` | UrlSigner |
| | | `readWindow(file, boundingBox)` | TemperatureGrid |
| draw points | US-6 | `drawPoints(points)` | TemperatureMap |
| color | US-6 | `colorFor(tavg)` | TemperatureMap |
| (one point per cell) | US-6 | `toPoints(boundingBox)` | TemperatureGrid |
| | | `fromCelsius(lat, lon, celsius)` | TemperaturePoint |
| click and see a point's values | US-7 | `showPopup(point)` | TemperatureMap |
| show a message | US-1, US-5, US-8 | `showError(message)` | MapPage |
| can't be reached | US-4, US-8 | `get(path)`, `post(path, body)` report network errors | ApiClient |
| compare places | US-6 | Rejected: done by the user, not the system |

## Step 4: Key concepts that shape the design

Some phrases aren't a single noun or verb but still decide part of the design:

| Phrase | Stories | Design decision |
|---|---|---|
| "never stored as typed" | US-1 | Passwords are hashed with bcrypt before **UserStore** sees them (information hiding) |
| "the same message" for wrong username or password | US-2 | **AuthController** returns one `401 Invalid credentials` for both cases |
| "session … continue when I refresh" | US-3 | The session lives in an HTTP-only cookie (**SessionToken**); **App** asks the server about it on every page load |
| "without logging in are sent to the login page" | US-3 | One shared check, **AuthGuard**, in front of every protected route |
| "asking for the same month again is nearly instant" | US-6 | **TemperatureController** keeps a cache of recent months |
| "outside data service" | US-6, US-8 | **MonthLoader** and **UrlSigner** isolate all contact with Planetary Computer, so failures map to one `502` response |

## Result

The parse produces the 17 classes on the [CRC cards](./crc-cards.pptx):

- **Frontend (React):** App, ApiClient, LoginPage, RegisterPage, MapPage, DateSelector, TemperatureMap
- **Backend (Express):** AuthController, AuthGuard, SessionToken, User, UserStore, TemperatureController, MonthLoader, UrlSigner, TemperatureGrid, TemperaturePoint

It also gives the **actors** (Visitor, Registered User) and the **external entities** (Azure Database for MySQL, Microsoft Planetary Computer, OpenStreetMap tile server) on the [user story diagrams](./user-story-diagrams.pdf).
