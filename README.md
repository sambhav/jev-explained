# Jev Explained

An independent, interactive guide for product managers and builders with a basic understanding of LLMs.

## Reading path

1. `index.html`: routing, uncertainty and the three output types.
2. `architecture.html`: compare complete outputs and separate documented behavior from inferred internals.
3. `agents.html`: a five-step refund case, including pending records, permissions and tool failure; then request dependencies.
4. `benchmarks.html`: recorded execution and nine-model workflow comparisons, with measurement boundaries.
5. `economics.html`: estimate whole-workflow cost and latency from explicit assumptions.

`patterns.html` indexes optional search, tool-selection, notification, browser, game and context-selection examples. Every page links to the guide contents and its appropriate continuation. `walkthroughs.js` supplies the scripted scenario states and request-count logic, covered by regression tests.

## Run locally

```sh
python -m http.server 8765
# Open http://localhost:8765
node --test tests/*.test.cjs
```

Static HTML/CSS/JS, no build step or API credentials. D3 7.9.0 and highlight.js 11.11.1 are vendored with licenses. The core educational demos run locally; videos and the optional benchmark explorer load external media when requested.

## Evidence and calculations

Teaching examples are scripted, not Jev calls. Benchmark labels in `benchmarks.js` were read from the rendered chart at https://evals.typesafe.ai/ on 18 September 2026. They are rounded, equal-weight means over four workflows in workflow mode, using provider-default reasoning. The accuracy metric is agreement with model-generated references, not human-labeled ground truth. Calculated ratios are approximate.

The price default is TypeSafe's published launch price, $0.042 per million input tokens with free output. Other calculator defaults are illustrative and editable. `economics.js` exports its pure calculation for tests. The model includes shared costs and serial fallbacks, but excludes human review, errors, caching discounts and tail-latency distributions.

Videos are recordings hosted by their original publishers, with source links and timing limitations alongside them. No recordings are relabeled as new live measurements. Third-party embedding permissions can change; the source links remain available.

## Publish

GitHub Pages serves the repository root on `main`; the existing public address is https://sambhav.dev/jev-explained/.
