# almost-new-outpost-ui
Software Design 3 web application to learn inventory management.

The React front end for **Almost New 24/7 Outpost**, a hopeful little merchant shop in a city that nature has taken back. Every screen answers one question: **can this signed-in user perform this action?**

The UI talks to the ASP.NET Core API in the sibling repo **`almost-new-outpost-api`**. Every API call goes through one API layer (`src/api/`), which can be answered two ways:

- **Real API:** HTTP requests to the running API, which needs MySQL. See [Switching to the real API](#switching-to-the-real-api).
- **Mock mode:** the same calls answered by **mock JSON data in the browser**, so you can work on the UI without the API. See [Mock mode](#mock-mode). The automated tests always use mock mode.

One environment variable, `VITE_USE_MOCKS`, switches between them. No page or component changes.

---

## Prerequisites

- **Node.js 20.19+ or 22.12+** (what Vite 7 requires). Check with:

  ```powershell
  node -v
  ```

- npm (comes with Node).

## Install and run (PowerShell)

```powershell
cd almost-new-outpost-ui
Copy-Item .env.example .env.development   # first time only
npm install
npm run dev
```

Open http://localhost:5173 and log in with one of the demo accounts below.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the tests and re-run them as you save files |
| `npm run test:run` | Run the tests once |
| `npm run coverage` | Run the tests once and write a coverage report |

## Tests and coverage

The tests use [Vitest](https://vitest.dev) with React Testing Library and run in a simulated browser (jsdom). They always run in **mock mode**, so you don't need the API or MySQL running, and `.env.development.local` doesn't affect them. Test files sit next to the code they test (`*.test.js` / `*.test.jsx`). Shared setup is in `src/test/setup.js`, and the settings are in the `test` section of `vite.config.js`.

### Running tests

```powershell
npm run test:run                              # everything, once
npm test                                      # watch mode: re-runs affected tests when you save
npx vitest run src/api/api.test.js            # one file
npx vitest run src/auth                       # one folder
npx vitest run -t "Remember me"               # only tests whose name contains this text
```

In watch mode, press `h` to see the shortcuts (for example `f` re-runs only failed tests and `q` quits).

### What kind of tests these are

| Kind | Files | What they check |
| --- | --- | --- |
| Unit | `utils/formatters`, `mocks/rules/rules`, `auth/tokenStorage`, `mocks/mockToken`, `api/httpClient`, `hooks/hooks`, `components/common/common`, `components/inventory/inventory` | One function, hook or component on its own, with made-up data or a fake network |
| Integration | `api/api`, `auth/auth`, `pages/LoginPage/LoginPage`, `components/admin/ProductForm` | Several real pieces together: a page or `src/api/` function → `httpClient` → the mock API's rules |
| App-level integration | `App` | The whole React app (routes, guards, nav bar, pages): log in, browse, log out |

None of them are end-to-end (E2E) tests. Nothing here starts a real browser or calls the real API, so they **can't** catch CORS or HTTPS certificate problems, real API responses that differ from the mocks, or CSS, layout and animation issues. Before a demo, still click through the app with the real API running.

### Writing tests

- **Imports:** import `describe`, `it`, `expect` and `vi` from `vitest`. They aren't globals here.
- **Finding elements:** prefer `screen.getByRole(...)` / `getByLabelText(...)` and `userEvent` (from `@testing-library/user-event`), so tests use the page the way a person would.
- **Wait for API results:** calls through `src/api/` reach the mock API, which waits 250–600 ms. In component tests, use `await screen.findBy...(...)` (add `{ timeout: 2000 }` when a page makes several calls). In tests that call `src/api/` directly, use fake timers to skip the wait. See `call()` in `src/api/api.test.js`.
- **Routing:** wrap anything that uses links or `useNavigate` in `<MemoryRouter initialEntries={['/some/path']}>`.
- **Signing in:**
  - For real sign-in state, wrap in `<AuthProvider>`.
  - For a fixed user, use `<AuthContext.Provider value={...}>` (see `src/auth/auth.test.jsx`).
  - To be signed in for API calls, save a token: `saveToken(createMockToken({ sub: '5', exp: <future seconds> }), false)` signs you in as `admin`.
- **401 responses:** after a 401 (from any request except login), `httpClient` sends the browser to `/login`, which jsdom can't do. Tests that can hit a 401 start with `window.history.replaceState({}, '', '/login')`.
- **Shared data between tests:** the mock database (`src/mocks/mockDb.js`) is shared by the tests in one file and reset between files. Make each test create what it needs, and don't depend on test order.
- **Automatic cleanup:** `localStorage`, `sessionStorage` and anything rendered are cleared after every test.

### Coverage

Run `npm run coverage` to get a summary table in the terminal and a full report in the `coverage/` folder:

```powershell
npm run coverage
Start-Process coverage\index.html   # open the report in your browser
```

In the report, click a folder, then a file. Lines highlighted red never ran during the tests, and yellow marks a branch (one side of an `if` or `? :`) that never ran. The `coverage/` folder is git-ignored.

## Demo accounts (mock mode only)

| Username | Password | Role | Can buy |
| --- | --- | --- | --- |
| citizen | citizen123 | Citizen | Basic |
| scout | scout123 | Scout | Basic, Exploration |
| medic | medic123 | Medic | Basic, Medical |
| security | security123 | Security | Basic, Security |
| admin | admin123 | MerchantAdmin | Everything + Manage Products |

The passwords are stored in plain text in `src/mocks/data/users.json` **only because it is mock data**. The real API stores password hashes.

---

## Mock mode

With `VITE_USE_MOCKS=true` (the default in `.env.development`):

- `src/api/httpClient.js` swaps axios's network adapter for `src/mocks/mockAdapter.js`.
- The adapter matches each request (method + URL) to a handler in `src/mocks/handlers/`, waits 250–600 ms to feel like a network, and returns the same response and error objects axios builds for a real server. That means the 401/403 interceptors, error messages and loading states all behave exactly as they will with the real API.
- Handlers read the `Authorization: Bearer` token to know who is calling, just like the server will. The mock token is a fake, unsigned `mock.<base64 JSON>` string, laid out like a JWT so the UI decodes both the same way.
- `src/mocks/rules/` holds small pure functions that copy the future server rules: role-to-category access, the 25% weather surcharge and the weather schedule.
- **All changes live in memory and reset when you reload the page:** purchases, admin product edits and weather overrides.
- A **Mock mode** panel (bottom right) lets any signed-in user force the weather (Clear, Storm, Dust Storm, Radiation Event) to see every banner and price state immediately. It only appears in mock mode.

The weather moves through `Clear, DustStorm, Clear, Storm, Clear, RadiationEvent`, one step every 5 minutes, worked out from the clock so a reload doesn't restart it. For faster demos, set `VITE_MOCK_WEATHER_MINUTES=1`.

**Rule:** pages and components never import from `src/mocks/`. Only `src/api/httpClient.js` does (test files may, too). Check it with:

```powershell
Get-ChildItem src -Recurse -Include *.js, *.jsx -Exclude *.test.* | Select-String "mocks/" | Where-Object { $_.Path -notmatch "\\src\\mocks\\" }
```

## Environment variables

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_USE_MOCKS` | `true` | `true` answers requests from `src/mocks`; `false` sends real HTTP requests. Mock mode is also used when the variable isn't set at all. |
| `VITE_API_BASE_URL` | `https://localhost:7001/api` | Base URL of the ASP.NET Core API, including `/api` |
| `VITE_MOCK_WEATHER_MINUTES` | `5` | Mock mode only: minutes between weather changes |

`.env.development` holds no secrets and is meant to be committed; create it from `.env.example` the first time (the app still runs in mock mode without it). For your own machine, copy `.env.example` to `.env.development.local`. Files ending in `.local` are git-ignored and override the committed values. Restart `npm run dev` after changing any env file.

## Switching to the real API

1. Start the API (`almost-new-outpost-api`) so it listens on `https://localhost:7001`. Make sure its CORS policy allows `http://localhost:5173` and the `Authorization` header.
2. Trust the .NET dev certificate once, so the browser accepts `https://localhost:7001`:

   ```powershell
   dotnet dev-certs https --trust
   ```

3. Create `.env.development.local` in this folder:

   ```
   VITE_USE_MOCKS=false
   VITE_API_BASE_URL=https://localhost:7001/api
   ```

4. Restart the dev server (`Ctrl+C`, then `npm run dev`).
5. Log in with the users the API seeded. The demo list under the login card disappears because it only shows in mock mode.

If the API isn't running you'll see a clear "Can't reach the outpost server" message instead of a crash.

Keep `src/mocks/` even once the real API is in use: the automated tests run against it. If you ever remove it, the tests that import from it (or call `src/api/`) need a replacement first.

---

## The API contract the UI expects

All paths are relative to `VITE_API_BASE_URL`. Errors use ASP.NET Core ProblemDetails: `{ title, status, errors: { field: [messages] } }`.

| Method | Path | Who | Notes |
| --- | --- | --- | --- |
| POST | `/auth/login` | anyone | `{ username, password }` → `{ accessToken, expiresAtUtc, user: { id, username, role } }` |
| GET | `/auth/me` | signed in | `{ id, username, role }` |
| GET | `/products?search=&sortBy=name\|price&sortDir=asc\|desc` | signed in | `[{ productId, name, categoryId, categoryName, description, basePrice, currentPrice, canPurchase, iconKey }]` |
| GET | `/products/{id}` | signed in | one product |
| GET | `/categories` | signed in | `[{ categoryId, categoryName }]` |
| POST | `/purchases` | signed in | `{ productId }` → 201 `{ purchaseId, productId, productName, purchaseDate, finalPrice }`; 403 if the role can't buy it |
| GET | `/purchases/me?limit=` | signed in | caller's purchases, newest first |
| GET | `/weather/current` | signed in | `{ condition, displayName, isDangerous, multiplier, fetchedAtUtc, nextRefreshUtc, serverTimeUtc, source, isStale }` |
| GET/POST | `/admin/products` | MerchantAdmin | body `{ name, description, categoryId, priceCredits, iconKey }` |
| PUT/DELETE | `/admin/products/{id}` | MerchantAdmin | 409 on duplicate name, or delete with purchase history |
| PUT/DELETE | `/admin/weather/override` | MerchantAdmin | body `{ condition }` |

Admin product responses use `priceCredits` (the database column name); shopper product responses use `basePrice` and `currentPrice`.

## How the code is organised

```
src/
  config.js        reads the env variables once
  api/             one file per area; the only code that makes HTTP calls
  mocks/           mock adapter, in-memory db, handlers, rules, JSON data
  auth/            AuthContext (the only global state), token storage, route guards
  pages/           one folder per page (component + CSS)
  components/      layout, inventory, admin and shared (common) components
  hooks/           useProducts, usePurchases, useWeather, useCountdown, useDebounce
  styles/          tokens.css (every colour/size) and global.css
  utils/           small formatting helpers and iconFor (iconKey → icon)
  test/            setup.js: runs before every test file
  **/*.test.js(x)  tests, next to the code they test
```

**Backgrounds:** `src/assets/backgrounds/overgrown-city.svg` is a drawn stand-in. To use a real photo, add it to that folder and point `--bg-image-city` in `src/styles/tokens.css` at it. To use plain CSS gradients instead, set `--app-background: var(--bg-gradient-fallback);`.

**Remember me:** checked stores the token in `localStorage` (you stay signed in after closing the browser); unchecked uses `sessionStorage` (signed out when the tab session ends). Storing tokens in web storage is fine for a local teaching app, but any script on the page can read it. An httpOnly cookie is the stronger option and is worth discussing in the security labs.
