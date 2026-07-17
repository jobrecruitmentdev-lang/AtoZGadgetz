---
name: keyword-cluster-generator
description: Generates comprehensive keyword clusters and content silos for topical authority. Guides the agent in identifying pillar topics, extracting long-tail variations, classifying search intent, and organizing them logically to boost SEO and domain authority.
tools: [WebFetch, Read, Write]
---

## Purpose

Use this skill whenever working on:
- SEO strategy and content planning
- Generating keyword clusters (Hub and Spoke model)
- Building topical authority for a new website or blog
- Mapping user search intent to content formats

---

## 1. Core Principles of Topical Authority

Topical authority is achieved by completely covering a broad subject (Pillar) through a series of interlinked, highly specific articles (Spokes / Clusters).

1. **Pillar Page:** A broad, comprehensive guide on the core topic. (e.g., "Ultimate Guide to Smart Home Gadgets")
2. **Cluster Pages:** In-depth articles covering specific subtopics or long-tail keywords related to the pillar. (e.g., "Best Smart Plugs for Alexa in 2026", "How to Secure Your Smart Home Network")
3. **Internal Linking:** Every cluster page MUST link back to the pillar page, and the pillar page MUST link out to all cluster pages.

---

## 2. Generating a Keyword Cluster

When asked to generate a keyword cluster for a niche or topic, follow this structured process:

### Step 1: Identify the Seed Topic
Determine the core topic (e.g., "Wireless Headphones", "Dropshipping Automation").

### Step 2: Categorize by Search Intent
Every keyword in the cluster must be mapped to a specific user intent. Use these 4 categories:
1. **Informational (I):** The user wants to learn something ("how to...", "what is...", "guide to..."). Content format: Tutorials, guides, FAQs.
2. **Navigational (N):** The user is looking for a specific brand or page ("AtoZGadgets login"). Content format: Landing pages, about us.
3. **Commercial Investigation (C):** The user is researching before buying ("best...", "... vs ...", "reviews"). Content format: Listicles, comparison guides, reviews.
4. **Transactional (T):** The user is ready to buy ("buy...", "discount...", "cheap..."). Content format: Product pages, category pages, checkout.

### Step 3: Map the Hub and Spoke Architecture
Create a detailed outline organizing the keywords into silos.

Format your output like this:

**Pillar Page:** [Main Topic Title]
- **Target Keyword:** [Broad Keyword]
- **Search Intent:** Informational / Commercial

**Cluster 1: [Subtopic A]**
- [Long-tail Keyword 1] (Intent) - Suggested Title: "..."
- [Long-tail Keyword 2] (Intent) - Suggested Title: "..."

**Cluster 2: [Subtopic B]**
- [Long-tail Keyword 3] (Intent) - Suggested Title: "..."
- [Long-tail Keyword 4] (Intent) - Suggested Title: "..."

---

## 3. SEO Best Practices for Clustering

When generating the clusters, enforce these SEO rules:

- **Avoid Keyword Cannibalization:** Ensure no two cluster pages target the exact same intent and primary keyword. If they are too similar, merge them.
- **Include "People Also Ask" (PAA):** Integrate common questions into the cluster as H2/H3 subheadings or dedicated FAQ pages.
- **URL Structure:** Suggest SEO-friendly URL slugs.
  - *Good:* `/smart-home/best-alexa-plugs`
  - *Bad:* `/post-id-1234-best-alexa-plugs-2026-update`
- **Semantic Relevance (LSI):** Suggest Latent Semantic Indexing (LSI) keywords or secondary terms that should naturally appear in the content to prove comprehensive coverage to search engines.

---

## 4. Output Checklist

When delivering the final cluster to the user, ensure you have provided:
- [ ] A clearly defined Pillar Page concept.
- [ ] At least 3-5 distinct sub-clusters (Spokes).
- [ ] 3-5 long-tail keywords per sub-cluster.
- [ ] Search intent classification (I, N, C, T) for every keyword.
- [ ] Suggested article titles and SEO-friendly URL slugs.
- [ ] A brief internal linking strategy recommendation.
