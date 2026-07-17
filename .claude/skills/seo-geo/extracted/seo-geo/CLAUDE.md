# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code **skill** package (`seo-geo`) that performs Generative Engine Optimization (GEO) audits — analyzing how well a URL is positioned for AI-powered search surfaces (Google AI Overviews, ChatGPT Search, Perplexity, Bing Copilot).

Invoked via `/seo-geo [url]` or when the user mentions "AI Overviews", "SGE", "GEO", "AI search", "LLM optimization", "Perplexity", "AI citations", "ChatGPT search", or "AI visibility".

## Skill Architecture

```
SKILL.md                          — Skill definition + full audit criteria (the runtime loads this)
references/
  google-ai-optimization-guide.md — Primary source: Google's canonical GEO position (May 2026)
  llmstxt-evidence.md             — Evidence base for llms.txt non-impact on citations
```

`SKILL.md` is the entry point. It contains the scoring rubric, crawler tables, output format, and quick-win recommendations. The `references/` files are cited within `SKILL.md` and provide deeper evidence for two specific topics.

## Core Editorial Rules (Must Follow)

**GEO = SEO, per Google.** Always frame GEO findings as SEO fundamentals applied to AI-search surfaces — never as a separate discipline. Cite `references/google-ai-optimization-guide.md` as the canonical source.

**Myth-busting gate:** When a community recommendation contradicts Google's published position, flag the contradiction explicitly and defer to Google. The myth list (from `SKILL.md`) includes: llms.txt as a citation lever, content chunking, AI-specific rephrasing, inauthentic mention-farming, and over-investment in structured data for AI.

**llms.txt:** Report presence/absence and well-formedness, but assign **zero citation-ranking weight**. No major AI search system consumes it as of May 2026 (Mueller, Illyes, SE Ranking 300k-domain study). See `references/llmstxt-evidence.md`.

**Brand mentions > backlinks:** Ahrefs Dec 2025 study (75k brands) — brand mentions correlate 3× more strongly with AI visibility than backlinks. YouTube mentions are the strongest single signal (~0.737 correlation).

## Scoring Weights

| Dimension | Weight |
|---|---|
| Citability Score | 25% |
| Structural Readability | 20% |
| Authority & Brand Signals | 20% |
| Technical Accessibility | 20% |
| Multi-Modal Content | 15% |

Optimal passage length for AI citation: **134–167 words**.

## Output Contract

Every audit produces `GEO-ANALYSIS.md` with exactly these sections (from `SKILL.md`):
1. GEO Readiness Score: XX/100
2. Platform breakdown (Google AIO, ChatGPT, Perplexity scores)
3. AI Crawler Access Status
4. llms.txt Status
5. Brand Mention Analysis
6. Passage-Level Citability
7. Server-Side Rendering Check
8. Top 5 Highest-Impact Changes
9. Schema Recommendations
10. Content Reformatting Suggestions

## Key Facts to Keep Accurate

- AI Overviews: 1.5B users/month, 200+ countries, 50%+ query coverage
- Only **11% of domains** are cited by both ChatGPT and Google AIO for the same query
- 92% of AI Overview citations come from top-10 ranking pages, but 47% come from positions 6–10
- AI crawlers **do not execute JavaScript** — SSR is critical for technical accessibility
- Last verified: May 2026. Re-check `references/google-ai-optimization-guide.md` quarterly.

## Updating This Skill

When Google publishes new GEO guidance, update `SKILL.md` and `references/google-ai-optimization-guide.md` together. When llms.txt gains confirmed consumption by a major AI search system, update `references/llmstxt-evidence.md` and remove the weight=0 constraint from `SKILL.md`.
