# Jev Explained

An independent, interactive guide for product managers and builders with a basic understanding of LLMs.

## Reading path

- `index.html`: core idea, interactive ticket routing, business value and boundaries.
- `agents.html`: five-step agent walkthrough with uncertain-evidence and permission scenarios.
- `architecture.html`: an interactive comparison of sequential text output and direct judgments, with documented behavior separated from inferred internals.
- `benchmarks.html`: publisher recordings, a native Browser Use video, and nine-model workflow comparisons.
- `economics.html`: adjustable monthly costs, sequential latency, shared costs and LLM fallback; calculated-time animation.
- `patterns.html`, `browser.html`, `gaming.html`, `emerging.html`: deeper use cases.

## Run locally

```sh
python -m http.server 8765
# Open http://localhost:8765
node --test tests/economics.test.cjs
```

Static HTML/CSS/JS, no build step or API credentials. D3 7.9.0 and highlight.js 11.11.1 are vendored with licenses. The core educational demos run locally; videos and the optional benchmark explorer load external media when requested.

## Evidence and calculations

Teaching examples are scripted, not Jev calls. Benchmark labels in `benchmarks.js` were read from the rendered chart at https://evals.typesafe.ai/ on 18 September 2026. They are rounded, equal-weight means over four workflows in workflow mode, using provider-default reasoning. The accuracy metric is agreement with model-generated references, not human-labeled ground truth. Calculated ratios are approximate.

The price default is TypeSafe's published launch price, $0.042 per million input tokens with free output. Other calculator defaults are illustrative and editable. `economics.js` exports its pure calculation for tests. The model includes shared costs and serial fallbacks, but excludes human review, errors, caching discounts and tail-latency distributions.

Videos are recordings hosted by their original publishers, with source links and timing limitations alongside them. No recordings are relabeled as new live measurements. Third-party embedding permissions can change; the source links remain available.

## Publish

GitHub Pages serves the repository root on `main`; the existing public address is https://sambhav.dev/jev-explained/.
