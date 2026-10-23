---
title: Revise Bulkhead design scope and section inventory
date: 2026-10-23
summary: "Synchronize design gate, reusable sections, merchant recipes, dependencies and effort without implementation"
---

# Revise Bulkhead design scope and section inventory

## What happened
Updated the existing Bulkhead plan and contract after design-scope review. Added phase 00 and a merchant-facing section inventory; synchronized phases 01–09 without editing mockup or implementing theme code.

## Decisions
Kept one hardware/trade preset and guest/B2B layers. Defined 19 core sections, five design configurations and three editor recipes. Reused hero/banner, CTA and FAQ; standalone video and collection tabs remain optional outside v1. Added AC11/12 and explicit G0/G1/G2/G3 evidence gates. Recomputed 19.5 person-weeks plus 2 reserve; no calendar ETA. Full phase-8 gate matches numeric dependencies.

## Verification
Document smoke passed: 13 documents, 10 pending phases, acyclic dependency graph, index/frontmatter agreement, 78 valid local links/anchors, section ownership and 12 AC IDs. Six protected mockup source/document hashes unchanged. No Shopify integration or theme QA claimed.

## Next steps
Execute phase 0 only when requested to revise/review design. Phase 1 still needs stores and platform prototypes. Design approval, real-editor rehearsal and theme submission readiness remain pending.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
