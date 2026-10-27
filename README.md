# almost-new-outpost-ui
Software Design 3 web application to learn inventory management.

The React front end for **Almost New 24/7 Outpost**, a hopeful little merchant shop in a city that nature has taken back. Every screen answers one question: **can this signed-in user perform this action?**

There is no backend yet. Every API call goes through a real API layer (`src/api/`) that is currently answered by **mock JSON data in the browser**. When the ASP.NET Core API is ready, you switch to it by changing one environment variable. No page or component changes.

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

**Rule:** pages and components never import from `src/mocks/`. Only `src/api/httpClient.js` does. Check it with:

```powershell
Get-ChildItem src -Recurse -Include *.js, *.jsx | Select-String "mocks/" | Where-Object { $_.Path -notmatch "\\src\\mocks\\" }
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

Once the real API is fully in use you can delete `src/mocks/`, remove the two mock lines from `src/api/httpClient.js`, and delete the `DevToolbar` component.

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
```

**Backgrounds:** `src/assets/backgrounds/overgrown-city.svg` is a drawn stand-in. To use a real photo, add it to that folder and point `--bg-image-city` in `src/styles/tokens.css` at it. To use plain CSS gradients instead, set `--app-background: var(--bg-gradient-fallback);`.

**Remember me:** checked stores the token in `localStorage` (you stay signed in after closing the browser); unchecked uses `sessionStorage` (signed out when the tab session ends). Storing tokens in web storage is fine for a local teaching app, but any script on the page can read it. An httpOnly cookie is the stronger option and is worth discussing in the security labs.
