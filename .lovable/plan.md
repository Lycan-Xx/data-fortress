

# SecureVault: Implementation Plan

## Overview

Transform the existing CyberSec Toolkit into **SecureVault** -- a personal password manager with live breach monitoring. The frontend will be built and previewed in Lovable. The backend (Node.js + Express + SQLite) will be written as source files in the project but run separately in your local environment.

---

## What Changes

### Removed
- `src/components/EmailChecker.tsx` -- the standalone email breach checker tab is gone (the HIBP service logic moves to the backend scheduler)

### Kept As-Is
- `src/components/PasswordGenerator.tsx` -- becomes Tab 2
- `src/components/PasswordStrengthChecker.tsx` -- becomes Tab 3
- Dark hacker Tailwind theme, animations, index.css
- All shadcn/ui components

### Modified
- `src/App.tsx` -- wraps app in auth gate; renders `MasterLogin` when no JWT, otherwise renders tab layout
- `src/components/TabNav.tsx` -- tabs become Vault / Password Generator / Strength Checker; adds red breach count badge on Vault tab
- `src/pages/Index.tsx` -- tab 0 renders `VaultTable` instead of `EmailChecker`; manages JWT state and `isFirstRun` detection

### New Frontend Files
- `src/components/MasterLogin.tsx` -- setup and login screen for master password
- `src/components/VaultTable.tsx` -- credential table with breach status badges, reveal/edit/delete actions, "Scan Now" button
- `src/components/AddCredentialModal.tsx` -- modal form for adding/editing credentials with inline password generator and strength indicator
- `src/lib/api.ts` -- centralized API client (axios wrapper with JWT header injection)

### New Backend Files (written but not run in Lovable)

```text
backend/
  package.json
  tsconfig.json
  .env.example
  src/
    index.ts               -- Express app entry, mounts routes, calls initDB, starts scheduler
    config/index.ts        -- loads .env variables
    db/schema.ts           -- SQLite table creation (master_config, credentials)
    middleware/auth.ts      -- JWT verification middleware
    services/
      crypto.ts            -- AES-256-GCM encrypt/decrypt, PBKDF2 key derivation
      vault.ts             -- SQLite CRUD via better-sqlite3
      haveibeenpwned.ts    -- HIBP v3 k-anonymity email breach lookup
      scheduler.ts         -- node-cron job (every 6h), scans emails against HIBP
    controllers/
      authController.ts    -- setup (first-run) and login handlers
      credentialController.ts -- CRUD + reveal handlers
      breachController.ts  -- manual scan trigger
    routes/
      authRoutes.ts        -- POST /api/auth/setup, POST /api/auth/login
      credentialRoutes.ts  -- GET/POST/PUT/DELETE /api/credentials, GET /api/credentials/:id/reveal
      breachRoutes.ts      -- POST /api/breach/scan
      passwordRoutes.ts    -- POST /api/password/generate, POST /api/password/strength
```

---

## Frontend Architecture

### Auth Flow
1. App mounts and calls `GET /api/auth/status` to check if a master password has been set
2. If not set: show `MasterLogin` in "setup" mode (set + confirm password)
3. If set: show `MasterLogin` in "login" mode (single password field)
4. On success, JWT is stored in React state (not localStorage -- lost on refresh intentionally)
5. All subsequent API calls include `Authorization: Bearer <token>` via the api client

### Vault Tab
- On mount and window focus, fetches `GET /api/credentials`
- Renders a responsive table/card list with columns: Site, URL, Username, Password (masked), Breach Status, Actions
- Breach status badges: green "Safe", red "Compromised", grey "Unknown"
- Reveal button calls `GET /api/credentials/:id/reveal`, shows plaintext for 10 seconds
- Edit opens `AddCredentialModal` pre-filled with existing data
- Delete prompts confirmation then calls `DELETE /api/credentials/:id`
- "Scan Now" button calls `POST /api/breach/scan` and refreshes the table
- "Add Credential" button opens `AddCredentialModal` in create mode

### AddCredentialModal
- Fields: site name, URL, username, password
- "Generate" button next to password field calls the existing generator logic (client-side, same as PasswordGenerator component)
- Live strength indicator below password field
- Submit calls `POST /api/credentials` (create) or `PUT /api/credentials/:id` (edit)

### TabNav Updates
- Three tabs: Vault, Password Generator, Strength Checker
- Red badge on Vault tab showing count of compromised credentials
- Mobile card-stack swipe navigation retained

---

## Backend Architecture

### Database (SQLite via better-sqlite3)

**master_config table:**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Always 1 |
| password_hash | TEXT | bcrypt hash |
| created_at | TEXT | ISO timestamp |

**credentials table:**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| site_name | TEXT | |
| site_url | TEXT | |
| username | TEXT | |
| encrypted_password | TEXT | AES-256-GCM ciphertext (hex) |
| iv | TEXT | 12-byte IV (hex) |
| auth_tag | TEXT | GCM auth tag (hex) |
| breach_status | TEXT | 'safe', 'compromised', 'unknown' |
| last_scanned | TEXT | ISO timestamp or null |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

### Security
- Master password hashed with bcrypt (12 rounds) and stored in `master_config`
- AES-256-GCM encryption key derived from master password via PBKDF2 (100k iterations, SHA-256)
- JWT signed with `JWT_SECRET`, 1-hour expiry, contains user identifier
- Master password included in JWT payload (single-user local app tradeoff) for decryption at request time
- HIBP queries use k-anonymity (only first 5 chars of SHA-1 hash sent)
- Helmet for HTTP security headers, express-rate-limit on all routes

### Scheduler
- node-cron expression: `0 */6 * * *` (every 6 hours)
- Fetches all credentials, extracts emails (usernames containing @)
- Deduplicates, queries HIBP for each with 1500ms delay between requests
- Updates `breach_status` and `last_scanned` in SQLite

### Backend Dependencies
`better-sqlite3`, `node-cron`, `jsonwebtoken`, `bcrypt`, `helmet`, `express-rate-limit`, `cors`, `dotenv`, `express`, `generate-password`, `zxcvbn` (plus their `@types/*` counterparts)

---

## Environment Variables (backend/.env.example)

```
PORT=3001
JWT_SECRET=your-random-secret-at-least-32-chars
ENCRYPTION_PEPPER=optional-extra-entropy
HIBP_API_KEY=your-hibp-api-key
CRON_SCHEDULE=0 */6 * * *
```

---

## Implementation Order

1. Create `src/lib/api.ts` (API client)
2. Create `src/components/MasterLogin.tsx`
3. Create `src/components/AddCredentialModal.tsx`
4. Create `src/components/VaultTable.tsx`
5. Modify `src/App.tsx` and `src/pages/Index.tsx` (auth gate, tab routing)
6. Modify `src/components/TabNav.tsx` (new tabs, breach badge)
7. Remove `src/components/EmailChecker.tsx`
8. Create all backend files (`backend/` directory)

---

## Notes for Running Locally

After implementation, to run the backend:
1. `cd backend && npm install`
2. Copy `.env.example` to `.env` and fill in values
3. `npm run dev` (starts Express on port 3001)
4. The frontend API client will need the backend URL configured (defaults to `http://localhost:3001`)

The frontend will work in Lovable's preview with mock/fallback data when the backend is unreachable, so you can still demo the UI.

