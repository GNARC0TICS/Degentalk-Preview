# DegenTalk Project Brief (MVP Edition)

## Project Name
**DegenTalk**

## Overview
DegenTalk is a next-gen crypto-native forum and social platform for degens, traders, builders, and gamblers. It combines a feature-rich discussion board with real-time social mechanics, a platform-exclusive token (DGT), and a gamified XP economy that rewards engagement, not fluff.

## Core Problem Solved
Traditional platforms lack:
- On-site token economies and tipping systems.
- Reputation mechanics that *actually* mean something.
- A home for unfiltered, long-form, crypto-native chaos.

DegenTalk fixes that by turning forum posting into a game, clout into currency, and the community into an engine.

## Target Users
- Degenerate gamblers & crypto traders
- Builders & Web3 devs who want feedback, alpha, or users
- Meme lords & terminally online shitposters
- Anyone rugged by Reddit, bored by Discord, or banned from CT

## Key Modules (MVP Focused)
- **Forum Core:** Threads, replies, reactions, rich text, tags, quote/saved status
- **XP & Level System:** Posts earn XP; levels unlock perks
- **DGT Wallet & Utility:** Internal currency with real USD value peg ($0.10), earned or purchased
- **Tipping & Rain:** Community token flows through `/tip` and `/rain` mechanics
- **Degen Shop:** Cosmetic item unlocks (signatures, flairs, username styles)
- **Admin Tools:** XP/DGT distribution, bans, moderation logs, economy tuning

## Build Stack
**Frontend:** React (Vite), TailwindCSS, Framer Motion  
**Backend:** Node.js/Express, Neon PostgreSQL, Drizzle ORM  
**Payments:** Stripe (fiat), CCPayment (crypto, USDT)  
**Infra:** Vercel (frontend), Cloudflare CDN, GitHub/Cursor AI (dev pipeline)

---

# DegenTalk Manifesto

### “This isn’t for everyone. It’s for us.”

A forum built like a casino.  
An XP system forged in shitposts.  
A community that rewards effort, not algorithms.

No paid roles. No corporate filters. Just raw clout.

---

## XP & DGT System: TL;DR for MVP

### 🔹 XP (Experience Points)
- Earned via posting, tipping, referrals, and reactions
- Never spent — fuels leveling, rep, and unlocks
- XP cap: **1000/day**

### 🔸 DGT (DegenToken)
- Internal-only token pegged at **$0.10 USD**
- Earned through:
  - Milestones (e.g. referrals)
  - Admin grants or faucet
  - Buying via Stripe or CCPayment
- Used for:
  - Cosmetic shop items
  - Tipping & raining others
  - Gated content/forum access

### 🪙 Peg & Ratio
- **1000 XP = 1 DGT**
- Symbolic XP bonus for being tipped: **10 XP/DGT**

---

## XP Example Actions (MVP)

| Action                 | XP    |
|------------------------|-------|
| Daily post             | 25 XP |
| Reaction received      | 5 XP  |
| Faucet claim (1/day)   | 50 XP |
| Referral signup        | 100 XP |
| Referral hits Level 3  | 200 XP |
| Tipped (1 DGT)         | 10 XP (max 200 XP/day) |

---

## Degen Shop (Initial Items)

| Item                     | Cost (DGT) | Notes                         |
|--------------------------|------------|-------------------------------|
| Signature Unlock         | 10 DGT     | Enables signature use         |
| Animated Signature       | 75 DGT     | Glitch/flex text effect       |
| Gradient Username        | 150 DGT    | Premium name styling          |
| Custom Font Pack         | 250 DGT    | Alternate font styles         |
| Legendary Theme Skin     | 500 DGT    | Full reskin for power users   |

---

## Tipping & Rain (v1 Logic)

**/tip @user 10 dgt**  
- User gets tokens + 10 XP/DGT tipped  
- Min: 1 DGT  
- XP Cap: 200 XP/day  
- Optional: 1–5% fee to treasury

**/rain 10 dgt**  
- Min: 5 DGT  
- Max 15 recipients  
- Eligible users = active in threads/shoutbox  
- Cooldown: 1/hour per user

---

## Anti-Abuse (Active from Day 1)

- XP cap per day = 1000  
- Separate XP cap from tipping = 200  
- Faucet IP/device-locked  
- Referral = 1 reward per verified device  
- Withdrawals disabled unless user hits Level 2 + holds 3+ DGT

---

## Admin Controls (Planned for MVP)

- Economy Config (peg, caps, faucet settings)
- Grant XP/DGT to users
- Reset/refund item purchases
- Enable/disable shop items
- Live leaderboard of XP, DGT, and tipping

---

## Project Goals (Short-Term)

- ✅ Launch functional forum with wallet, tipping, and shop
- ✅ Finalize XP/DGT system + admin controls
- 🔄 Polish mobile PWA experience
- 🔄 Activate invite/referral tracking
- 🟡 Begin community onboarding + stealth launch

---

## Final Notes

- DGT is **not a token** (yet). Internal only.
- No plans for trading or bridging — this is about status, not speculation.
- All values, rates, and shop prices stored in a **central config file**.

This is our foundation.  
Now we build chaos on top of it.

— *Goombas, 2025*
