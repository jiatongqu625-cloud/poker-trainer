# Progress

Last updated: 2026-02-11

## ✅ Done
- Repo scaffold: Next.js (App Router) + TS + Tailwind + Prisma + SQLite dev.
- Anonymous user sessions via cookie.
- Scenarios page + scenario editor v2:
  - tableType (6max/9max)
  - hero position + villain positions
  - pot type (SRP/3BP/4BP) + aggressor + callers
  - trainingNode + board profile weights (dry/wet/high/low)
- Training flow:
  - Generate hand/board
  - Mixed-frequency recommendation
  - User action grading + storage
  - "Drill this spot more" creates child scenario
- Opponents:
  - Create opponent profiles
  - Import simple hand history text and update basic stats (VPIP/PFR/3B/CB)
- Explanations:
  - SPR (approx) computed and shown
  - Why-this-strategy bullets
  - Glossary definitions rendered in UI
- Training nodes:
  - Taxonomy added and used in scenario editor
  - Quick spot builder (human inputs → suggested training node)
  - Engine heuristics are node-aware
  - VS_CBET nodes use Fold/Call/Raise actions + MDF term
  - Expanded nodes: probe / delayed / XR / donk (MVP)
  - Training UI switches action sets based on node kind (betting/defense/XR)

## 🚧 In progress
- Expand node taxonomy to cover common SRP/3BP/4BP postflop branches in a consistent naming scheme (donk/probe/delayed/xr/etc).
- Make engine output action-sets strictly consistent with node type (betting nodes vs defense nodes vs XR nodes). (Server returns allowedActions; strategy is now restricted to allowed actions.)
- Improve board generation to better reflect boardProfileWeights (wet/dry/high/low + connectedness/pairing).

## ⏭️ Next
- Add "node presets" UI so users can describe a spot in human terms (IP/OOP, street, facing bet?) and we map it to trainingNode. (Quick builder added; continue expanding presets.)
- Add richer dashboard analytics (mistakes by node/texture/SPR bucket).
- Add scenario editing (update/delete) and scenario cloning.
- Add opponent influence into recommendations (adapt strategy based on opponent stats).

## ❓ Decisions needed (when we get there)
- Naming scheme finalization for nodes (keep short tokens vs more explicit tree paths).
- App Store route: PWA vs Capacitor vs React Native.
- Auth/account model: anonymous-only vs sign-in (Apple/Google) + sync.
