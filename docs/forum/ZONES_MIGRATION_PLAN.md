# Zones Migration Plan

_This playbook outlines the steps for migrating from the legacy forum system to the new zone-based, config-driven architecture._

---

## 1. Migration Order
- List the order in which zones/forums should be migrated (e.g., Primary Zones first, then General Forums)

## 2. Slug Reservation
- Steps to reserve and enforce all new zone slugs
- Update reservedRoutes.ts and backend validation

## 3. Thread Reassignment
- How to reassign threads/posts from legacy forums to new zones (if needed)

## 4. Marking Deprecated/Merged Zones
- How to mark zones as `deprecated` or `merged` in DB/registry
- Steps for archiving or removing old data

## 5. DB & Registry Sync
- Ensuring DB and zoneRegistry.ts are in sync
- Automation/scripts for validation

## 6. Contributor Checklist
- Step-by-step tasks for devs/PMs during migration

## 7. Rollback Plan
- [Placeholder for steps to safely revert migration if needed]

---

_This plan will be updated as migration proceeds._ 