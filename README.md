# PT Atlas

A bilingual (English/Vietnamese) dashboard for personal trainers (PT): an interactive 3D muscle atlas plus quick health calculators, built as a visual teaching and consultation aid for use with clients on the gym floor. The atlas is a fork of [Human Atlas](https://github.com/ashemag/human-atlas) (React, Three.js, shadcn/ui), focused on the muscular system and extended with a curated library of muscle groups: common gym names, function, suggested exercises, and technique/safety notes.

This covers **Phase 1** (the interactive muscle atlas) and **Phase 2** (BMI/TDEE/macro calculators, extended with a food-group meal-plan and lifestyle/training advice generator per client feedback) of a three-phase project (see the project brief). Full **Phase 3** (persisted, multi-visit Inbody tracking across a client's history) is not included — see "InBody & meal-plan advice" below for the scope boundary that keeps this session-only.

## Atlas tab

- Defaults to the **muscular system**; toggle the **skeletal system** on to point out bone/tendon attachment points.
- Click a muscle on the 3D model — or search/browse the muscle-group list — to open a panel with its common Vietnamese gym name, English/anatomical name, function, 2–4 suggested exercises, and safety notes.
- Toggle language with the **VI / EN** switch in the top bar; your choice is remembered.
- Orbit, zoom, isolate a structure, and "explode" the model into a spaced inventory of every visible piece.
- Compact controls and large touch targets (44px minimum) for use on a tablet or laptop next to a client.

## Calculators tab

- BMI classified with the **Asian-Pacific (IDI & WPRO)** cutoffs (not the generic WHO scale), BMR/TDEE via the **Mifflin–St Jeor** equation with 5 activity levels, and a goal-based macro split (lose weight / maintain / build muscle) — see `app/calculators.ts`.
- Inputs auto-save to this device (`localStorage`) so a PT can pick up where they left off — no account needed, nothing is sent to a server.
- "Priority muscle groups to train" cross-links each suggested group straight into the Atlas tab with its detail panel already open.

### InBody & meal-plan advice

- **Optional InBody fields** (body fat %, skeletal muscle mass, total body water, visceral fat level) refine the advice below when filled in; everything also works from BMI + goal alone. Classification bands (`app/advice.ts`) are general PT-conversation reference ranges, not a clinical diagnosis.
- **Personalization**: cooking ability, diet type + foods to avoid, food budget, and prep time per meal (all optional, default to reasonable middle values) filter a **7 or 10-day food-group framework menu** (`app/meal-plan.ts`) — portion guidance by food group (carb/protein/veg/fat) with a rotating example dish per slot, not a clinical diet plan. Every preference combination is guaranteed a dish for every slot (a universal, allergen-free fallback dish backs each of the 4 meal slots).
- **Lifestyle & training advice**: goal-aware behavior tips (sleep, hydration, consistency, etc.), sharpened further when InBody data flags something worth a conversation (e.g. elevated visceral fat, low muscle mass), plus a training-frequency/split suggestion.
- Everything here is **session-only**, saved to this device's `localStorage` alongside the rest of the calculator inputs — there is no multi-visit client history or backend. Whether to add that (local-only per PT vs. a shared backend with login) is the architecture decision the original brief reserves for a full Phase 3 and still needs to be confirmed with the client before building.
- A prominent disclaimer accompanies this section: PT-consultation aid only, not a substitute for a doctor or registered dietitian, and the "foods to avoid" filter is a convenience, not a verified allergy safety guarantee.

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
