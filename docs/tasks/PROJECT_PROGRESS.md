# Project Progress Tracker

Last update: 2026-02-21

## Goal
Build and publish a bilingual (PL/EN) scholarship project website documenting:
- VST plugin (images, documentation, download)
- Composition created with the plugin
- Research/conference materials

## Source Inputs Read
- `docs/tasks/Initial_plan.md`
- `docs/tasks/Initial_plan_project_draft.md`
- `docs/tasks/Initial_plan_project_edit_script_v1.md`
- `docs/context/kontekst wniosek.pdf` (core sections extracted: title, timeline, task schedule, indicators)

## Scholarship Tasks (from context PDF)
1. Courses and training (09.2025-10.2025)
Status: done (content reflected in timeline).
2. International conference presentation (10.2025-11.2025)
Status: done (research section scaffolded).
3. VST plugin concept and implementation (10.2025-12.2025)
Status: in progress (project + downloads sections scaffolded).
4. Composition using generative tools (12.2025-01.2026)
Status: in progress (composition section scaffolded).
5. Open workshops and lectures (12.2025-02.2026)
Status: planned (timeline + progress references added).
6. Documentation and distribution (01.2026-02.2026)
Status: planned/in progress (downloads page and docs block created).

## Website Implementation Tasks
- [x] Initialize Astro project with Tailwind and MDX.
- [x] Add PL/EN route structure (`/pl/*`, `/en/*`).
- [x] Build shared layout + language switch.
- [x] Implement main project landing page in PL and EN.
- [x] Implement supporting pages: home, downloads, updates, bio.
- [x] Add visual placeholder hero image and portfolio styling.
- [x] Initialize git repository (`main` branch).
- [ ] Replace placeholder links (`example.com`, demo media) with final URLs.
- [ ] Add real binary versions and checksum values.
- [ ] Add actual conference assets (abstract/slides/video/program).
- [ ] Add workshop section details and evidence materials.
- [ ] Configure final deployment URL/domain and CI for GitHub Pages.

## Notes / Next Focus
- Primary CTA is already aligned to plugin download flow.
- Structure follows the combined page model (VST + composition + research).
- Content placeholders are clearly marked and ready for final project assets.
