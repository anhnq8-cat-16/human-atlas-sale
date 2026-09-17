# PT Atlas

An interactive 3D muscle atlas built for personal trainers (PT) to use as a visual teaching aid with clients on the gym floor. It is a fork of [Human Atlas](https://github.com/ashemag/human-atlas) (React, Three.js, shadcn/ui), focused on the muscular system and extended with a curated, bilingual (English/Vietnamese) library of muscle groups: common gym names, function, suggested exercises, and technique/safety notes.

This is **Phase 1** of a three-phase project (see the project brief). Phase 1 scope: the interactive muscle atlas only. Health calculators (BMI/TDEE) and Inbody-based recommendations are later phases, not included here.

## Explore

- Defaults to the **muscular system**; toggle the **skeletal system** on to point out bone/tendon attachment points.
- Click a muscle on the 3D model — or search/browse the muscle-group list — to open a panel with its common Vietnamese gym name, English/anatomical name, function, 2–4 suggested exercises, and safety notes.
- Toggle language with the **VI / EN** switch in the top bar; your choice is remembered.
- Orbit, zoom, isolate a structure, and "explode" the model into a spaced inventory of every visible piece.
- Compact controls and large touch targets (44px minimum) for use on a tablet or laptop next to a client.

## Muscle group content

`app/muscle-groups.ts` is a **generated file** — see `scripts/build-muscle-groups.mjs`. It matches ~22 curated PT muscle groups against verified `atlas.json` part names and re-generates the id mapping automatically; only the bilingual content itself (names, function, exercises, tips) is hand-authored, in the same script.

Two groups — **Lats** (latissimus dorsi) and **Abs** (rectus abdominis) — have full bilingual content but no dedicated 3D mesh, because the underlying BodyParts3D reference does not model them as separate structures. This is disclosed in the app itself rather than faked with a misleading mesh substitution.

To regenerate after editing content or updating `public/models/atlas.json`:

```sh
node scripts/build-muscle-groups.mjs
```

## Run locally

Requires Node.js 22.13 or newer. No API keys or accounts are needed.

```sh
npm ci
npm run dev
```

Open http://localhost:3016. To build the static site, run `npm run build`; the output is in `dist/`.

## Validate

```sh
npm run check
node scripts/validate-atlas.mjs
node scripts/validate-interactions.mjs
npm run build
```

## Anatomy data

The viewer uses **BodyParts3D 4.0**, an adult male reference anatomy, licensed **CC BY 4.0**. It does not represent every human structure or variation — notably the latissimus dorsi and rectus abdominis (see above). Full credits, source links, and adaptation details are in [ATTRIBUTION.md](public/ATTRIBUTION.md).

This is an educational and PT-consultation tool, not a diagnostic, medical, or surgical one.

## Deploy

Import this repository into Vercel as a Vite project. The included `vercel.json` configures `npm ci`, `npm run build`, and the `dist` output directory. It can also be served by any static host.

## License

Original application code (Human Atlas) and this fork's additions are released under the [MIT License](LICENSE). **The anatomy data has its own CC BY 4.0 license**; preserve the attribution when redistributing it. Third-party dependencies retain their respective licenses.
