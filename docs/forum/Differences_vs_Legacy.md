# Differences vs Legacy Forum System

_This document summarizes all key differences between the new platform-grade forum architecture and the legacy system, for contributors and migration planning._

---

## 🚀 Quick Reference: Most Critical Changes
- [Placeholder for 5-7 bullet points summarizing the most impactful changes for devs/PMs]

---

## 1. Field Mapping: Legacy → New
- Table mapping old schema fields (e.g., `isZone`, `canonical`, `colorTheme`, etc.) to new config/schema fields (e.g., `forum_type`, `theme`, etc.)

## 2. Deprecated Concepts & Files
- List of legacy concepts, fields, and files to be archived or removed
- Mapping of which new files or configs supersede them

## 3. New Config-Driven Features
- Registry-driven zone/forum config
- Dynamic component mounting
- Per-zone thread rules and RBAC
- SEO, metrics, and display priority

## 4. API & Endpoint Changes
- New endpoints (e.g., `/api/zone/:slug/metrics`)
- Registry-driven data flow
- Deprecated endpoints

## 5. Admin Panel & Automation
- Admin UI for editing zone/forum config
- Automation for migration, registry sync, slug reservation, etc.

## 6. Summary Table: Key Differences
- Table summarizing all major changes, with columns for Area, Legacy, New, Action Needed

## 7. Migration/Refactor Checklist
- Steps for contributors to follow when updating code, docs, and data

---

_This document will be updated as the migration proceeds._ 