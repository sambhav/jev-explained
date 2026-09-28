# Decision Models, explained through Jev

An independent, interactive visual essay for product managers and builders with a basic understanding of LLMs. It shares its voice and visual system with [Dynamic Tools](https://sambhav.dev/dynamic-tools/).

## Experience

One continuous essay in eight parts: what Jev is (Noul, Choice, Score), how to use it (request shape, limits, fan-out, confidence, dependencies), how a conventional LLM answers versus how Jev answers (documented behaviour, Archer Hume's measurements, an illustrative attention mask), a three-lane speed race on the same questions (LLM writes JSON, LLM reads labels, Jev), the open clones grouped into four families, unique uses, a cost and latency calculator, and the documented jagged edges of jev-1.13. Dark by default with a light theme switch, responsive layout and reduced-motion support.

The old chapter URLs redirect to the matching section of `index.html`.

## Source map

- `index.html`: the essay.
- `essay.css`: design tokens, layout and figure styles, matching Dynamic Tools.
- `essay.js`: theme switch.
- `learn.js`, `home-labs.js`: confidence routing, answer types, the two-path walkthrough and request dependencies.
- `walkthroughs.js`: scripted scenario states and request-count logic, covered by regression tests.
- `race.js`: the side-by-side speed model, exported for tests.
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
