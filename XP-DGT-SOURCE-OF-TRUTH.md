# 📜 DegenTalk XP & DGT Economy – Source of Truth

**Last updated:** 2025-06-19

This markdown file is the canonical reference for every constant, formula, cap and business rule that touches the XP & DGT economy. Agents, developers and CI pipelines must treat this document as immutable truth – if the numbers here differ from code, the code is wrong.

---

## 1. Core Pegs

| Constant     | Value         | Notes                                    |
| ------------ | ------------- | ---------------------------------------- |
| `DGT_TO_USD` | **$0.10 USD** | 1 DGT equals ten US cents (internal peg) |
| `XP_PER_DGT` | **1000 XP**   | Effort equivalent of 1 DGT               |

---

## 2. Daily & Action Caps

| Metric                | Cap                             |
| --------------------- | ------------------------------- |
| **Total XP / Day**    | `MAX_XP_PER_DAY = 1 000`        |
| **XP from /tip**      | `MAX_TIP_XP_PER_DAY = 200`      |
| **XP from Reactions** | `MAX_REACTION_XP_PER_DAY = 100` |
| **Faucet Claims**     | `1 per IP / Account / 24 h`     |

---

## 3. XP Earnings Table

| Action                        | XP              | Notes                |
| ----------------------------- | --------------- | -------------------- |
| First Post                    | **50**          | One-time bonus       |
| Daily Post                    | **25**          | Once every 24 h      |
| Reaction Received             | **5**           | Up to 100 XP/day     |
| Faucet Claim                  | **50**          | Optional feature     |
| Referral Signup (referee)     | **50**          | see §5               |
| Referral Milestone (referrer) | **200**         | When referee hits L3 |
| Tipped (bonus)                | **10 XP / DGT** | Max 200 XP/day       |

---

## 4. DGT Earnings Table

| Source                        | DGT      |
| ----------------------------- | -------- |
| Referral Signup (referee)     | **1**    |
| Referral Milestone (referrer) | **5**    |
| Admin Grants / Airdrops       | Variable |
| Daily Faucet (if enabled)     | **0.5**  |

---

## 5. Level Requirements (Explicit Map 1-10)

| Level  | Cumulative XP |
| ------ | ------------- |
| 1 → 2  | 250           |
| 2 → 3  | 750           |
| 3 → 4  | 1 500         |
| 4 → 5  | 2 500         |
| 5 → 6  | 4 000         |
| 6 → 7  | 6 000         |
| 7 → 8  | 8 500         |
| 8 → 9  | 11 500        |
| 9 → 10 | 15 000        |

**Formula for Level ≥ 11**  
`XP = (level ** 2 * 250) – 250`

---

## 6. Smart-Adjustable Config Object (reference implementation)

```ts
export const economyConfig = {
	DGT_TO_USD: 0.1,
	XP_PER_DGT: 1000,
	MAX_XP_PER_DAY: 1000,
	MAX_TIP_XP_PER_DAY: 200,
	MIN_TIP_DGT: 1,
	FAUCET_REWARD_XP: 50,
	FAUCET_REWARD_DGT: 0.5,
	MIN_WITHDRAWAL_DGT: 3,
	levelXPMap: {
		2: 250,
		3: 750,
		4: 1500,
		5: 2500,
		6: 4000,
		7: 6000,
		8: 8500,
		9: 11500,
		10: 15000
	},
	referralRewards: {
		referee: { dgt: 1, xp: 50 },
		referrer: { dgt: 5, xp: 200 }
	},
	rainSettings: {
		minAmount: 5,
		maxRecipients: 15,
		cooldownSeconds: 3600
	}
} as const;
```

> NOTE: This JSON-serialisable object will be mirrored inside `shared/economy/economy.config.ts` and persisted via the Admin → Economy panel. Runtime services **must** read from that module, not from literals.

---

## 7. Anti-Abuse Rules

1. **One faucet claim / IP / 24 h** – enforced via DB + Redis lock.
2. **Referral reward triggers exactly once per unique device + verified account.**
3. **Withdrawals gated** – user ≥ Level 2 **and** balance ≥ 3 DGT.
4. **XP caps** applied before persisting logs to avoid DB spam.

---

## 8. Future-Facing Flags

| Flag                      | Default | Description                           |
| ------------------------- | ------- | ------------------------------------- |
| `enableXpToDgtConversion` | false   | Swaps XP directly for DGT at peg rate |
| `enableExternalDgt`       | false   | Turns on-chain transfer hooks         |

---

### Contributing

• Update this file **and** bump `economyConfig.version` when adjusting numbers.  
• PRs touching economic values require team lead approval.

---

**End of document – keep numbers sacred.**
