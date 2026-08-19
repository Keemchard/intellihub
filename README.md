# IntelliHub

**The front door to network analytics & insights.**

IntelliHub is a data marketplace/catalog application. It lets people **discover, understand, trust, and request access** to an organization's dashboards, data products, reports, and KPIs — all in one place — and includes a built-in assistant ("IntelliBot") that answers questions about the catalog in plain language.

This README covers both what the product does (for anyone evaluating or using it) and how it's built (for developers picking up the codebase).

---

## 1. What it does (for users)

- **Marketplace** — Browse and search all analytics assets (dashboards, data products, reports, KPIs) in one catalog. Filter by domain, segment, certification status, and tags.
- **Product & KPI detail pages** — See ownership, stewardship, certification/trust status, KPI definitions and formulas, thresholds, and data lineage ("Data Sources & Provenance") for anything in the catalog.
- **Access & Enablement** — Request access to a product directly from its page (choose an access tier, add a business justification), then track the request's status over time on a status timeline.
- **IntelliBot** — A chat widget available anywhere in the app that answers questions like "how do I get access?" or "what's the CWN Capacity Report?" by matching your question against the catalog.
- **Glossary** — Look up business term definitions maintained by data stewards.
- **Role-aware experience** — The app recognizes a handful of roles (Executive, Territory Lead, NTG Manager, Business Analyst, IntelliHub Admin), each with their own identity shown in the top bar.

---

## 2. How it's built (for developers)

### Tech stack

| Layer                 | Choice                                                              |
| --------------------- | ------------------------------------------------------------------- |
| Framework             | Next.js (App Router, React Server Components)                       |
| Language              | TypeScript                                                          |
| Data fetching / cache | TanStack React Query                                                |
| State                 | Zustand                                                             |
| Forms & validation    | React Hook Form + Zod                                               |
| UI primitives         | Radix UI (dialog, dropdown, tabs, slot)                             |
| Styling               | Tailwind (via `class-variance-authority`, `clsx`, `tailwind-merge`) |
| Icons                 | lucide-react                                                        |
| Theming               | next-themes                                                         |
| Fonts                 | Self-hosted "Jakarta" variable font family (`src/fonts`)            |

### Architecture at a glance

IntelliHub is a **Backend-for-Frontend (BFF)** app: the UI never talks to BigQuery or the access-workflow engine directly. Everything goes through Next.js Route Handlers under `src/app/api/*`, which call into server-only library code.

```
Browser (React client components)
   │  fetch("/api/...")
   ▼
Route Handlers (src/app/api/**/route.ts)
   │
   ├─▶ src/lib/data-access        (business logic: filtering, sorting, access-state derivation)
   │      │
   │      ├─▶ src/lib/bigquery-client + bigquery-mappers   (source-of-truth catalog data)
   │      └─▶ src/lib/data-access/access-store             (append-only access-request log)
   │
   └─▶ src/lib/access-provider    (swappable workflow-engine integration — see below)
```

Key architectural decisions baked into the code:

- **Defense in depth on auth.** `src/middleware.ts` guards routes at the edge (redirects unauthenticated users to `/login`), but every Server Component layout and every route handler independently re-checks the session via `getSession()` / `requireSession()`. Middleware is explicitly documented as _not_ the authorization boundary.
- **`accessState` is always derived, never stored.** Whether a user has access to a product (`granted` / `pending` / `none` / `rejected`) is computed on every request from the latest event in an **append-only** access-request event log (`src/lib/data-access/access-store.ts`), never written onto the product record itself.
- **The access-workflow engine is a pluggable seam.** `src/lib/access-provider` defines an `AccessProvisioningProvider` interface with two implementations:
  - `local-provider.ts` — no-op dev/demo provider (requests just sit "In Review").
  - `appsheet-provider.ts` — pushes new requests into AppSheet (Phase-1 workflow engine) and can be reconciled by pulling status. AppSheet is the system of record for the _workflow_; IntelliHub always owns the request record and its history. Status changes normally flow back **in**, via a secured webhook (`POST /api/integrations/appsheet/status`), not by polling.
  - Selected at runtime via the `ACCESS_PROVIDER` env var — swapping AppSheet for ServiceNow, Jira, or an internal IAM tool only touches this folder.
- **IntelliBot has a stable response contract.** `src/lib/intellibot/router.ts` is currently a deterministic keyword router (no GenAI/model calls) that scores catalog items against the query's tokens. It returns the same `BotResponse` shape (`intro`, `products`, `kpis`, `howto`) that a future RAG/GenAI-backed implementation would return, so `use-bot.ts`, `bot-widget.tsx`, and the chat UI never need to change when the "brain" is swapped.
- **BigQuery access is centralized and typed.** `src/lib/bigquery-client.ts` is the only place that calls the analytics API (`INTELLIHUB_API_URL` + `INTELLIHUB_API_KEY`), typed per source view (`ds_marketplace_sv`, `ds_data_product_detail_sv`, `ds_kpi_detail_sv`, `ds_glossary_detail_sv`, `ds_search_index_sv`). `src/lib/bigquery-mappers.ts` normalizes those raw rows into the app's `Product` / `Kpi` domain types (`src/types/index.ts`), which are all defined and validated with Zod.
- **Session is a signed, base64url-encoded cookie** (`ih_session`) read by both middleware and server code. The current login flow (`POST /api/auth/login`) is an explicit **dev-mock** that lets you pick a role — documented in the code as the seam where a real OIDC authorization-code flow will plug in later without touching anything downstream.

### Project root

```
intellihub-fe/
├── .env                       # Local environment values (gitignored)
├── .env.local.example         # Template — copy to .env / .env.local and fill in
├── .gitignore
├── next.config.ts
├── next-env.d.ts
├── package.json / package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json / tsconfig.tsbuildinfo
├── README.md
└── src/                       # Application code — see breakdown below
```

Standard Next.js (App Router) + TypeScript + Tailwind project layout — nothing bespoke at the root.

### Folder structure

```
src/
├── app/
│   ├── (public)/            # Landing + /login (no session required)
│   ├── (app)/                # Authenticated shell: home, marketplace, product/[id],
│   │                          # kpi/[id], glossary, access, intellibot
│   ├── api/                  # Route Handlers (the BFF layer)
│   │   ├── auth/              login, logout
│   │   ├── products/          list + detail
│   │   ├── kpis/               list + detail
│   │   ├── glossary/
│   │   ├── access-requests/   create/list/detail
│   │   ├── me/access/          current user's access summary
│   │   ├── intellibot/query/  chatbot Q&A
│   │   ├── bigquery/           thin passthroughs onto each BigQuery source view
│   │   └── integrations/appsheet/status/  inbound webhook from AppSheet
│   ├── layout.tsx / providers.tsx / globals.css / not-found.tsx
│   └── middleware.ts (project root, edge auth guard)
├── components/
│   ├── shell/                 Sidebar, TopBar
│   ├── shared/                 Reusable app-wide components
│   └── ui/                     Design-system primitives (buttons, dialogs, tabs, etc.)
├── config/nav.ts               Sidebar navigation config
├── features/                   Feature-sliced client logic + components
│   ├── access/                 Access & Enablement page, status timeline
│   ├── auth/                    Login screen
│   ├── bigquery/                Glossary/KPI/product detail clients + hooks
│   ├── intellibot/              Chat widget, composer, conversation, hook
│   └── marketplace/             Catalog browsing, filters, hook
├── lib/
│   ├── auth/                    session.ts (cookie), roles.ts (RBAC + tier rules)
│   ├── access-provider/         Pluggable workflow-engine integration (see above)
│   ├── data-access/              Business logic + in-memory access-request store
│   ├── intellibot/                Keyword-router "brain"
│   ├── query/                     React Query provider + query key factory
│   ├── bigquery-client.ts / bigquery-mappers.ts
│   ├── api-client.ts             Typed fetch wrapper for client components
│   ├── http.ts                    Route-handler response helpers (ok/badRequest/etc.)
│   ├── seed.ts                    Local demo/seed data
│   └── utils.ts
├── stores/ui.ts                  Zustand UI state (e.g. sidebar/panel state)
├── types/index.ts                All domain types & Zod schemas (single source of truth)
└── fonts/                        Self-hosted Jakarta font files
```

### Environment variables

| Variable                  | Required when                   | Purpose                                                                                                                                                                                                       |
| ------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INTELLIHUB_API_URL`      | Always (for real catalog data)  | Base URL of the analytics API backing the BigQuery source views                                                                                                                                               |
| `INTELLIHUB_API_KEY`      | Always (for real catalog data)  | Sent as `x-api-key` header to that API                                                                                                                                                                        |
| `ACCESS_PROVIDER`         | Optional                        | `local` (default) or `appsheet` — selects the access-workflow integration                                                                                                                                     |
| `APPSHEET_APP_ID`         | When `ACCESS_PROVIDER=appsheet` | AppSheet app identifier                                                                                                                                                                                       |
| `APPSHEET_API_KEY`        | When `ACCESS_PROVIDER=appsheet` | AppSheet Application Access Key                                                                                                                                                                               |
| `APPSHEET_WEBHOOK_SECRET` | Recommended in production       | Shared secret checked (via `x-intellihub-signature`, timing-safe compare) on the inbound `/api/integrations/appsheet/status` webhook. If unset, the webhook is only allowed outside of `NODE_ENV=production`. |
| `NODE_ENV`                | Standard Next.js                | Controls cookie `secure` flag and webhook auth fallback behavior                                                                                                                                              |

### Data model

All domain types live in `src/types/index.ts`, defined with Zod (validated, not just typed):

- **Product** — a dashboard, data product, report, or KPI card in the catalog (type, domain, owner/steward, trust/certification, access state, launch info, tags, etc.)
- **Kpi** — a KPI definition (formula, thresholds, upstream lineage, related products)
- **AccessRequest / AccessRequestEvent** — the append-only request + its history; `currentStatus` is `In Review | Approved | Rejected | More Information Required`
- **AccessGrant** — effective entitlement, derived from the event log
- **SessionUser** — the authenticated identity, with `RoleName` = `executive | territory | business | analyst | intellihub_admin`
- **BotResponse** — the stable contract IntelliBot's UI renders, independent of how it's generated

### Roles & access tiers

- Every authenticated role can currently use the whole app surface (`src/lib/auth/roles.ts` — `/admin` is reserved for `intellihub_admin` but has no UI yet in this phase).
- Access **tiers** (`Viewer`, `CYOD`, `Self-Serve`) are constrained per product: `CYOD`/`Self-Serve` are only offered for "Eagle Eye" family products; everything else is `Viewer`-only. This is enforced **server-side** in the request-creation route, not just in the UI.

### Running locally

1. `npm install`
2. Copy `.env.local.example` to `.env.local` (or edit `.env` directly) and fill in at least `INTELLIHUB_API_URL` / `INTELLIHUB_API_KEY` — or point/adjust `src/lib/bigquery-client.ts` if you want to run purely off `src/lib/seed.ts` demo data.
3. `npm run dev` and open `/login` — pick any of the demo roles to sign in (this issues the `ih_session` cookie).
4. To exercise the AppSheet integration locally without AppSheet, simulate its callback:
   ```bash
   curl -X POST http://localhost:3000/api/integrations/appsheet/status \
     -H "Content-Type: application/json" \
     -d '{"requestId":"REQ-0001","status":"Approved","note":"Approved for demo"}'
   ```

### API surface (all under `/api`)

| Route                           | Method   | Notes                                                        |
| ------------------------------- | -------- | ------------------------------------------------------------ |
| `/auth/login`                   | POST     | Dev-mock sign-in by role; sets session cookie                |
| `/auth/logout`                  | POST     | Clears session cookie                                        |
| `/products`                     | GET      | Filtered/sorted catalog list + facets (auth required)        |
| `/products/[id]`                | GET      | Product detail                                               |
| `/kpis`                         | GET      | KPI list                                                     |
| `/kpis/[id]`                    | GET      | KPI detail                                                   |
| `/glossary`                     | GET      | Glossary terms (auth required)                               |
| `/access-requests`              | GET/POST | List own requests / submit a new one                         |
| `/access-requests/[id]`         | GET      | Single request (owner-only)                                  |
| `/me/access`                    | GET      | Current user's granted/pending summary                       |
| `/intellibot/query`             | POST     | Ask IntelliBot a question                                    |
| `/bigquery/*`                   | GET      | Thin, auth-gated passthroughs onto each BigQuery source view |
| `/integrations/appsheet/status` | POST     | Inbound webhook from AppSheet (signature-checked)            |

### Code owners

This repo uses a [`CODEOWNERS`](./CODEOWNERS) file (GitLab convention — root, `/docs/`, or `/.gitlab/`) so merge requests show required reviewers automatically. Every path in the repo is currently owned by a person(s) inside `CODEOWNERS` file:

current:

```
* keemchard.tamio@gsupport.com.ph
```

Enable it via **Settings → Repository → Protected branches** — find your target branch (e.g. `main`) and toggle **"Code owner approval"** on for it. (This lives under Protected branches, not the Merge request approvals page.)

If ownership later needs to expand to a team or split by area (e.g. frontend / data / security), `CODEOWNERS` can list multiple owners per line or be broken into `[Section Name]` blocks per path group, optionally with a required approval count (e.g. `[Auth & Access][2]`) — see the [GitLab CODEOWNERS reference](https://docs.gitlab.com/user/project/codeowners/reference/).

---

## 3. Notable design principles worth preserving

If you extend this codebase, keep these intact — they're deliberate, not accidental:

1. **Never write access state onto a Product.** Always derive it from the event log.
2. **Never mutate an AccessRequest's history.** Only append new events.
3. **Keep the `AccessProvisioningProvider` interface as the only integration seam** for whatever system approves access next.
4. **Keep IntelliBot's `BotResponse` contract stable** even as the "brain" behind `routeQuery()` gets smarter (e.g., a future GenAI/RAG backend).
5. **Re-check the session server-side everywhere**, even where middleware already ran.
