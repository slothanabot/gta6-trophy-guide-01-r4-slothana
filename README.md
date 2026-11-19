# Vice City Trophy Ledger

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/slothanabot/gta6-trophy-guide-01-r4-slothana/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/slothanabot/gta6-trophy-guide-01-r4-slothana/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI PlayStation 5 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden until earned. A static web app: open `app/index.html` in a desktop browser and it works with the network off.

## What it does

- **Checklist tracker** — every trophy with its official name, description and grade, ticked off as you earn it. Progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Filters and search** — filter by kind (story, missable, collectibles, activities, online) and by grade, or search by name and description.
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until you earn them.
- **Roadmap to the Platinum** — six stages in the order to earn them: story first, then strangers and choices, collectibles, activities, robberies, and finally 100% completion.
- **Missables flagged** — 14 trophies flagged as missable, each with a note on when to save. These are our calls from the official descriptions: one-off missions, one-shot conditions and choice-based moments.
- **A guide for every trophy** — written in our own words, each one naming its sources. Where a place or step is not pinned down by the official description, the guide says so instead of inventing it.

## Sources

Names, descriptions, grades, hidden flags and PSN count targets are the official PlayStation 5 list as published on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), cross-checked on grades against the Planet GTA 6 trophy list. The guides are our own words from those descriptions. No Rockstar logo or official artwork is used, and the app makes no network requests at runtime.

## Run it

Serve `app/` with any static server, for example:

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080 — or open `app/index.html` directly. Demo mode: open with `?demo=1` to preview the tracker with 13 trophies pre-earned (it only seeds when nothing is saved yet).

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## License

MIT — see [LICENSE](LICENSE). Unofficial fan-made guide, not affiliated with Rockstar Games.
