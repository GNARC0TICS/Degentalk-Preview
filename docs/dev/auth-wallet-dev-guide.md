# Degentalk – Dev-Mode Auth & Wallet Quick-Start Guide

> Everything learned and fixed (2025-06-26) so any teammate can reproduce the flow in minutes.

---

## 1. What Was Broken

| Issue | Impact |
|-------|--------|
| Front-end `useAuth` queried `/api/auth/*` | Back-end only served auth at `/api/*` &nbsp;→&nbsp; every request 404'd & the AuthProvider stayed in **loading** state. |
| Extra `<AuthProvider>` wrappers added as a workaround | React context conflict – "Multiple AuthProviders detected" runtime error. |
| No valid session → wallet services never ran | Newly registered users did **not** get wallets, blocking wallet feature tests. |

---

## 2. Fix Implemented

### server/routes.ts (commented block)
```ts
/*
 * AUTHENTICATION ROUTES – canonical & legacy
 */
app.use('/api/auth', authRoutes); // ✅ new namespace
app.use('/api', authRoutes);      // 🕰️ temporary alias (remove in v2)
```

### docs/api/auth-api.md (new)
* Lists every auth endpoint.
* Shows example requests.
* Deprecation notice for root-level paths.

_All code changes are heavily commented so the reasoning is clear at a glance._

---

## 3. Starting the Stack (Dev)
```bash
# Terminal 1 – backend
npm run dev:backend   # Express on :5001

# Terminal 2 – frontend
npm run dev           # Vite on :5173 (proxy → 5001)
```
The Vite proxy in `config/vite.config.ts` forwards **/api/** to port 5001, including the new `/api/auth/*` routes.

---

## 4. Seeded Dev Accounts

| Username | Role  | Password       | Notes |
|----------|-------|---------------|-------|
| `DevUser`| admin | anything*     | Auto-seeded at boot. |

\* Password check is skipped in dev when `DEV_BYPASS_PASSWORD=true` (default).  
Set `DEV_FORCE_AUTH=true` if you want real hashing.

---

## 5. Creating & Testing a Real Account

```bash
# 1️⃣  Sign-up
POST /api/auth/register
{
  "username": "wallettest",
  "email":    "wallet@example.com",
  "password": "test123",
  "confirmPassword": "test123"
}
# → 201 Created (auto-activated in dev)

# 2️⃣  Log-in
POST /api/auth/login    # same creds (or any pwd if bypass enabled)

# 3️⃣  Verify wallets
GET  /api/wallet/dgt/:userId          # DGT wallet exists
```

During registration/login the backend runs:
```ts
await dgtService.initializeUserWallet(user.id);
await walletService.ensureCcPaymentWallet(user.id);
```
– In dev `walletConfig.DEV_MODE.MOCK_CCPAYMENT` uses a stub client, so no real network calls.

---

## 6. Helpful Dev-Only Endpoint

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/dev-mode/set-role?role=user\|mod\|admin` | Switch the **mock role** for the current session. |

---

## 7. Troubleshooting Checklist

1. **Auth stuck on loading** – ensure backend is running and `/api/auth/user` returns 200 (inspect Network tab).
2. **API calls return 401** – check the browser is sending the `session` cookie.
3. **Wallet missing** – verify `walletConfig.WALLET_ENABLED` resolves to `true` (default in dev).

---

## 8. Next Steps / Cleanup

* Migrate any remaining root-level auth calls to `/api/auth/*`.  
  The alias `app.use('/api', authRoutes);` will be **removed in v2**.
* Once all callers are updated, delete the compatibility line to keep the route table clean.

---

_Compiled by the AI assistant on 2025-06-26._ 