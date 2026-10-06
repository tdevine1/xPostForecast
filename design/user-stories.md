# xPostForecast User Stories

These are the user stories for the finished xPostForecast app (Sprint 4). Every later design artifact, from the grammatical parse to the component flowcharts, traces back to them by ID.

**Users of the system**

- **Visitor**: someone who opens the site without being logged in.
- **Registered User**: someone with an account who is logged in.

Each story follows the form *As a ⟨type of user⟩, I want ⟨goal⟩ so that ⟨reason⟩*, followed by acceptance criteria: the conditions that must be true for the story to count as done.

---

## Accounts and sessions

### US-1: Register an account

As a **visitor**, I want to **create an account with my email address, a username, and a password** so that **I can use the temperature map**.

Acceptance criteria:

- The email, username, and password are all required.
- The password must be at least 8 characters long.
- If the username or email address is already registered, the visitor sees a message saying so, and no account is created.
- The password is never stored as typed; only a secure hash of it is saved.
- After registering, the visitor is taken to the login page.

### US-2: Log in

As a **registered user**, I want to **log in with my username and password** so that **I can reach the temperature map**.

Acceptance criteria:

- A wrong username or a wrong password shows the same message, "Invalid credentials", so the page doesn't reveal which usernames exist.
- After logging in, the user is taken to the map page.
- After 20 login or registration attempts from the same address within 15 minutes, further attempts are refused with a message to wait.

### US-3: Stay logged in

As a **registered user**, I want **my session to continue when I refresh the page or reopen the tab** so that **I don't have to log in again every time**.

Acceptance criteria:

- Refreshing the map page keeps the user on the map page.
- A session lasts one hour. After that, the next data request sends the user back to the login page.
- Visitors who open the map page without logging in are sent to the login page.

### US-4: Log out

As a **registered user**, I want to **log out** so that **nobody else using this computer can use my session**.

Acceptance criteria:

- Logging out ends the session and returns the user to the login page.
- After logging out, opening the map page sends the user to the login page.
- The user is returned to the login page even if the server can't be reached.

---

## Temperature map

### US-5: Choose a month

As a **registered user**, I want to **choose a month and a year** so that **I can look at the temperatures for that month**.

Acceptance criteria:

- Months are chosen by name and years from a list, so no date has to be typed.
- The years offered run from 1895 to 2022, the years the NOAA dataset covers.
- Clicking **Fetch Data** before choosing both a month and a year shows a message asking for both.

### US-6: View the monthly temperature map

As a **registered user**, I want to **see the average temperature for the chosen month drawn across West Virginia** so that **I can compare places at a glance**.

Acceptance criteria:

- The map shows one colored point for each cell of NOAA's nClimGrid grid inside West Virginia's bounding box (about 9,700 points).
- Colors run from dark blue (−10 °F) through yellow to dark red (110 °F).
- A spinner shows while the data loads. The first request for a month can take several seconds; asking for the same month again is nearly instant.

### US-7: Inspect a location

As a **registered user**, I want to **click a point on the map and see its exact values** so that **I can read the temperature at a specific place**.

Acceptance criteria:

- Clicking a point shows its latitude and longitude (four decimal places) and its average temperature in °F (two decimal places).

### US-8: Understand why data is missing

As a **registered user**, I want **a clear message when temperatures can't be shown** so that **I know whether to pick another month or try again later**.

Acceptance criteria:

- For a month the dataset doesn't include (for example, December 2022), the page says no temperature data is available for that month.
- If the outside data service is unavailable, the page says so and suggests trying again later.
- If the app's own server can't be reached, the page says so.
