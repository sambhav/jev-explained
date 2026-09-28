# Decision Models, explained through Jev

An independent, interactive visual essay for product managers and builders with a basic understanding of LLMs. It shares its voice and visual system with [Dynamic Tools](https://sambhav.dev/dynamic-tools/).

## Experience

One continuous essay follows a payments platform's support queue on launch day: a checkout outage at 10:04, then a duplicate-charge refund at 10:19. It explains judgment versus policy, the three answer types (Noul, Choice, Score), generated text versus typed judgments, the agent loop and request dependencies, the published recordings and benchmarks, whole-workflow cost and latency, and the same pattern in search, browser agents, games, context compaction and Probably. A sticky story strip tracks the queue as you read. Dark by default with a light theme switch, responsive layout and reduced-motion support.

The old chapter URLs (`architecture.html`, `agents.html`, `benchmarks.html`, `economics.html`, `patterns.html`, `browser.html`, `gaming.html`, `emerging.html`) redirect to the matching section of `index.html`.

## Source map

- `index.html`: the essay.
- `essay.css`: design tokens, layout and figure styles, matching Dynamic Tools.
- `essay.js`: theme switch and the launch-day story strip.
- `learn.js`, `home-labs.js`: ticket routing, answer types, the two-path walkthrough, the agent walkthrough and request dependencies.
- `walkthroughs.js`: scripted scenario states and request-count logic, covered by regression tests.
- `benchmarks.js`, `economics.js`: the published benchmark snapshot and the cost and latency calculator.

## Run locally

```sh
python -m http.server 8765
# Open http://localhost:8765
node --test tests/*.test.cjs
```

Static HTML/CSS/JS, no build step or API credentials. highlight.js 11.11.1 is vendored with licenses. The core educational demos run locally; videos and the optional benchmark explorer load external media when requested.

## Evidence and calculations

Teaching examples are scripted, not Jev calls. Benchmark labels in `benchmarks.js` were read from the rendered chart at https://evals.typesafe.ai/ on 18 September 2026. They are rounded, equal-weight means over four workflows in workflow mode, using provider-default reasoning. The accuracy metric is agreement with model-generated references, not human-labeled ground truth. Calculated ratios are approximate.

The price default is TypeSafe's published launch price, $0.042 per million input tokens with free output. Other calculator defaults are illustrative and editable. `economics.js` exports its pure calculation for tests. The model includes shared costs and serial fallbacks, but excludes human review, errors, caching discounts and tail-latency distributions.

Videos are recordings hosted by their original publishers, with source links and timing limitations alongside them. No recordings are relabeled as new live measurements. Third-party embedding permissions can change; the source links remain available.

## Publish

GitHub Pages serves the repository root on `main`; the existing public address is https://sambhav.dev/jev-explained/.
