# Degentalk Forum & Zone Definitions

This document provides a comprehensive overview of the Degentalk forum structure, detailing all Primary and General Zones, their intended purpose, subforums, access rules, and any special components or theming logic they entail. It serves as an informal source of truth for understanding the platform's zone-based architecture.

---

## 🏛️ Primary Zones

Primary Zones are the main hubs of Degentalk, often featuring unique components, theming, and specific interaction logic. They serve as pillars for core platform activities and engagement.

---

### 🕳️ 1. The Pit
*“Raw, unfiltered, and often unhinged. The proving ground for every user, no matter how wrecked.”*

*   **Purpose**: Serves as a chaos and virality engine, allowing low-rank users a chance to shine with minimal restrictions.
*   **Type**: `PRIMARY`
*   **Access**: Public
*   **Permissions & Logic**:
    *   Posting limit: 1 unrestricted thread per month per user (configurable in admin panel). This is flagged in `zoneRegistry.ts` with `unrestrictedThreadPerMonth: true`.
    *   Threads within this limit have full freedom: custom fonts, images, GIFs, embeds, and no level gates for posting.
*   **Key Components/Theming**:
    *   Potentially a unique, gritty theme.
    *   Shoutbox component is prominent.
*   **Subforums**:
    *   `shitposting`: For general, low-effort, humorous content.
    *   `memes`: Dedicated to meme sharing and creation.
    *   `offtopic`: For discussions not fitting anywhere else.
    *   `experimental`: A space for users to try out new content formats or ideas.

---

### 🧠 2. Mission Control
*“Official dispatches, challenge ops, and leaderboard briefings. Controlled by Admins & Mods.”*

*   **Purpose**: The central hub for official platform activities, announcements, and admin-led events.
*   **Type**: `PRIMARY`
*   **Access**: Public (View), Restricted (Posting by Admins/Mods only). Users can reply/participate in challenges.
*   **Permissions & Logic**:
    *   Admins and Mods are the only users who can create new threads.
    *   Users can reply to participate in challenges, tasks, etc.
*   **Key Components/Theming**:
    *   Features dynamic leaderboards (`Leaderboards` component).
    *   XP system integration for task completions.
    *   Admin-generated bounties and giveaways (`BountyBoard` component).
    *   Likely a clean, official, or mission-oriented theme.
*   **Subforums**:
    *   `daily-tasks`: For recurring tasks and objectives.
    *   `giveaways`: Platform for official giveaways and prize events.
    *   `challenges`: Hosts community-wide challenges and competitions.
    *   `leaderboards`: Displays rankings for various platform activities.
    *   `event-ops`: Coordination and information for special platform events.

---

### 🔐 3. The Vault
*“Access granted. Home of gated knowledge, elite polls, and inner-circle talk.”*

*   **Purpose**: An exclusive area for VIP members and high-value contributors, fostering focused discussions and early access.
*   **Type**: `PRIMARY`
*   **Access**: Gated (Requires specific roles like `vip` or `high-roller`).
*   **Permissions & Logic**:
    *   Standard forum behavior (posting, replying) is available but restricted to users with the required roles.
    *   Capability for "read-only gems" threads, where content is valuable but not open for replies by all Vault members (potentially only by admins/mods or thread author).
*   **Key Components/Theming**:
    *   Likely an exclusive, premium theme.
    *   May feature enhanced polling or discussion tools.
*   **Subforums**:
    *   `vip-discussion`: General discussion area for VIP members.
    *   `hidden-gems`: For sharing high-value insights, alpha, or exclusive content.
    *   `alpha-only-polls`: Hosts polls that can influence platform development, visible/votable only by select members.
    *   `vault-archives`: For storing and accessing past high-value discussions from The Vault.

---

### 📜 4. The Briefing Room
*“Start here. Forum rules, roadmap, onboarding guides, and staff updates.”*

*   **Purpose**: The main information and onboarding center for all users.
*   **Type**: `PRIMARY`
*   **Access**: Public. Posting is allowed in select subforums (e.g., `introductions`, `support`).
*   **Permissions & Logic**:
    *   Some subforums (like `rules`, `announcements`, `roadmap`) are read-only for general users, with content managed by Admins/Mods.
*   **Key Components/Theming**:
    *   Clear, organized layout, focused on information delivery.
    *   Possibly integrates with a knowledge base or FAQ system.
*   **Subforums**:
    *   `introductions`: New users can introduce themselves.
    *   `rules`: Contains official platform and forum rules (read-only for users).
    *   `forum-features`: Guides and explanations of how to use forum features (read-only for users).
    *   `announcements`: Official staff announcements (read-only for users).
    *   `roadmap`: Information about the platform's development and future plans (read-only for users).
    *   `support`: For users to ask questions and request help.

---

### 🧊 5. The Archive
*“Legendary threads frozen in time. Read-only graveyard of brilliance and wreckage.”*

*   **Purpose**: A read-only museum for historically significant, exceptionally valuable, or notoriously disastrous threads.
*   **Type**: `PRIMARY`
*   **Access**: Public (Read-only for all users).
*   **Permissions & Logic**:
    *   No new posts or replies allowed from general users.
    *   Admins/Mods can "archive" threads by moving/flagging them into this zone.
*   **Key Components/Theming**:
    *   A distinct, perhaps "frozen" or "historic" theme.
    *   Emphasis on content display and readability.
*   **Subforums**:
    *   `legendary-threads`: Collection of the most memorable and impactful threads.
    *   `hall-of-gains`: Showcase of exceptional trading wins or successful calls.
    *   `historic-rekt`: A somber gallery of significant market losses and cautionary tales.

---

### 🛒 6. DegenShop™
*“Marketplace access, hot items, wishlist flex, and DGT-fueled cosmetics.”*

*   **Purpose**: The central forum hub related to the platform's shop, DGT utility, and cosmetic items.
*   **Type**: `PRIMARY`
*   **Access**: Public
*   **Permissions & Logic**:
    *   Allows discussions, showcases, and wishlists related to shop items.
*   **Key Components/Theming**:
    *   Integrates with the main `/shop` feature.
    *   `LiveListings` component to show hot items or new arrivals.
    *   May have a marketplace or e-commerce-inspired theme.
*   **Subforums**:
    *   `cosmetics`: Discussions and showcases of user cosmetic items.
    *   `exclusive-items`: Focus on rare, limited, or exclusive shop offerings.
    *   `dgt-utility`: For items that have specific DGT token utilities or integrations.
    *   `wishlist`: Users can post and discuss items they wish to see in the shop.

---
---

## 🌐 General Zones

General Zones cater to a wide array of topics and communities, allowing for broad discussion and niche interests. They typically follow standard forum behavior with public access.

---

### 📈 1. Market Moves
*“TA, coin calls, and degenerate optimism.”*

*   **Purpose**: Discussions centered around market analysis, trading strategies, and cryptocurrency price movements.
*   **Type**: `GENERAL`
*   **Access**: Public
*   **Subforums**:
    *   `signals-ta`: For sharing and discussing technical analysis, charts, and trading signals.
    *   `moonshots`: For speculating on low-cap cryptocurrencies and high-risk/high-reward plays.
    *   `red-flags`: A space to warn others about potential scams or problematic projects.

---

### 🧪 2. Alpha & Leaks
*“Early plays, token gossip, and stuff you shouldn't know.”*

*   **Purpose**: Sharing and discussing early-stage project information, token rumors, and "insider" tips (use with caution).
*   **Type**: `GENERAL`
*   **Access**: Public
*   **Subforums**:
    *   `token-intel`: For deeper dives, research, and analysis of various tokens.
    *   `pre-sales`: Discussions around whitelists, IDOs, and upcoming token launches.
    *   `screenshots`: For sharing "leaked" information, direct messages, or other "proof" (often speculative).

---

### 🎰 3. Casino & Degen
*“Wagers, rage posts, unsolicited strategies.”*

*   **Purpose**: A zone for discussions related to crypto gambling, casino games, and high-risk degen activities.
*   **Type**: `GENERAL`
*   **Access**: Public
*   **Subforums**:
    *   `limbo-dice`: Dedicated to games like Limbo, Dice, and other classic degen gambling forms.
    *   `mines-keno`: For clicker-style casino games like Mines and Keno.
    *   `rage-logs`: A place for users to vent about losses or bad beats.

---

### 🛠️ 4. Builder's Terminal
*“Dev logs, debugging, tool drops, and builder cope.”*

*   **Purpose**: A community for developers in the Web3 space to share progress, ask for help, and showcase tools.
*   **Type**: `GENERAL`
*   **Access**: Public
*   **Subforums**:
    *   `dev-diaries`: For developers to share their project journey, logs, and updates.
    *   `code-snippets`: A repository for reusable code, problem-solving, and coding help.
    *   `tool-drops`: A place to announce and discuss new developer tools, libraries, or APIs.

---

### 🎯 5. Airdrops & Quests
*“Click. Grind. Pray. Share your links here.”*

*   **Purpose**: Centralized location for sharing and finding information about airdrops, online quests, and referral programs.
*   **Type**: `GENERAL`
*   **Access**: Public
*   **Subforums**:
    *   `quests-tasks`: For platforms like Galxe, Zealy, Layer3, and other task-based reward systems.
    *   `claim-links`: Direct links for airdrop claims (users should DYOR).
    *   `referral-events`: For sharing invite-based tasks and referral links.

---

### 📰 6. Web3 Culture & News
*“Drama, memes, launches, and chain wars.”*

*   **Purpose**: Discussions about the broader Web3 ecosystem, including news, cultural trends, memes, and inter-chain rivalries.
*   **Type**: `GENERAL`
*   **Access**: Public
*   **Subforums**:
    *   `general-news`: For sharing and discussing major industry events and news.
    *   `memes`: Dedicated to Web3 and crypto-related memes.
    *   `chain-fights`: A battleground for maximalists and supporters of different blockchain ecosystems.

---

### 🧩 7. Beginner's Portal
*“No stupid questions. Only bad answers.”*

*   **Purpose**: A welcoming space for newcomers to Web3 and crypto to ask questions, learn basics, and get guidance.
*   **Type**: `GENERAL`
*   **Access**: Public
*   **Optional Logic**: May have posting limits for new users to prevent spam (e.g., `postingLimits: { maxThreadsPerDay: 5 }`).
*   **Subforums**:
    *   `getting-started`: Onboarding guides and foundational information.
    *   `terminology`: Definitions of common crypto and Web3 acronyms and terms.
    *   `wallets-safety`: Basic operational security (OpSec), scam prevention, and wallet usage guides.

---

### 📢 8. Shill & Promote
*“Projects, referrals, and maybe your OnlyFans.”*

*   **Purpose**: A designated area for users to promote their projects, share referral links, or advertise services. Content should be clearly marked.
*   **Type**: `GENERAL`
*   **Access**: Public
*   **Subforums**:
    *   `token-shills`: For promoting altcoin projects and lesser-known tokens.
    *   `casino-refs`: For sharing referral links to gambling platforms.
    *   `self-promo`: For users to share their content, services, or personal links (within platform guidelines).

--- 