# Skills & Agents Guide — rapidwhale27661

> **Before starting any task — read both files:**
> 1. **`DEVELOPMENT.md`** — all coding rules, CSS/ESLint/JCR/design spec
> 2. **This file** (`SKILLS-GUIDE.md`) — what skills and agents are available and when to use them

---

## Quick Reference — Which to Use When

Check this table FIRST at the start of every task.

| Situation | Use This | When |
|---|---|---|
| Building a brand new block | `eds-ue-specialist` (agent) | When task starts |
| Editing JS or CSS of existing block | `eds-ue-block-development` (skill 2) | After editing |
| Adding/changing model fields | `eds-ue-content-modeling` (skill 3) | After `_*.json` changes |
| **Before opening a PR** | **`eds-ue-quality-and-publishing` (skill 4)** | **Every PR, no exceptions** |
| Fresh machine setup or something broken | `eds-ue-project-setup` (skill 1) | Rarely |
| Creating AEM Content Fragments | `aem-cf-agent` (planned — not yet built) | Future tasks |
| Not sure — just describe the task | `eds-ue-specialist` handles it | Anytime |

---

## What is a Skill?

A **Skill** is a set of instructions that tells Claude exactly how to handle a specific type of task — like building a block or checking quality before a PR. Instead of explaining the rules every time, Claude reads the skill and follows it automatically.

## What is an Agent?

An **Agent** is a specialist that combines multiple skills and runs them in the right order. Think of it as a senior developer who already knows all the project rules.

---

## The 1 Agent

### `eds-ue-specialist`
**What it does:** The master agent for all EDS/UE work. Automatically uses all 4 skills in the correct order.

**Workflow — when to trigger it:**
```
1. You decide to build a new block      ← task starts here
2. Say: "Build a new xcel-alert block"  ← you talk to Claude
3. ← AGENT RUNS HERE →                 Claude uses eds-ue-specialist automatically
4. Agent works through all 4 skills     ← JS + CSS + JSON + lint
5. You get a full working block + summary ← done
```

> **Rule:** Any time you say "build a block" or "create a component" — `eds-ue-specialist` runs. You do not need to trigger it manually.

---

## The 4 Skills

### Skill 1 — `eds-ue-project-setup`
**What it does:** Checks that the project is correctly set up — required files exist, npm dependencies installed, local dev commands ready.

**Workflow — when to trigger it:**
```
1. You open the repo on a new machine   ← or something feels broken
2. Say: "Check if this project is set up correctly"
3. ← SKILL 1 RUNS HERE →               Claude checks all required files + deps
4. You get: ready-to-run confirmation   ← or a list of what's missing
5. Fix anything missing, then start work
```

> **Rule:** Only needed on first setup or when something is broken. You will rarely use this.

---

### Skill 2 — `eds-ue-block-development`
**What it does:** Enforces correct block structure — JS + CSS + JSON all present, CSS scoped, decorator handles missing fields gracefully.

**Workflow — when to trigger it:**
```
1. We finish writing the block code     ← JS and CSS done
2. Say: "Check the block structure is correct"
3. ← SKILL 2 RUNS HERE →               Claude reviews JS + CSS + JSON
4. Any issues flagged and fixed         ← missing file, leaked CSS, etc.
5. Block is ready for quality check (Skill 4) before PR
```

> **Rule:** Runs automatically during block building. You can also call it explicitly after editing a block's JS or CSS.

---

### Skill 3 — `eds-ue-content-modeling`
**What it does:** Handles all UE model file changes — updates `_block.json`, runs `npm run build:json` to rebuild the 3 generated files.

**Workflow — when to trigger it:**
```
1. We add or change a field in a model  ← _block.json edited
2. Say: "Rebuild the JSON models"
   OR it runs automatically after any model change
3. ← SKILL 3 RUNS HERE →               npm run build:json executes
4. component-definition.json            ← rebuilt ✅
   component-models.json                ← rebuilt ✅
   component-filters.json               ← rebuilt ✅
5. New field is now visible in UE palette
```

> **Rule:** Every time a `_*.json` model file changes — Skill 3 must run. Never skip this step or UE will not show the new field.

---

### Skill 4 — `eds-ue-quality-and-publishing`
**What it does:** Quality gate before any PR. Runs `npm run lint`, checks for issues, gives a go/no-go.

**Workflow — when to trigger it:**
```
1. We build / make changes              ← coding happens here
2. We commit + push                     ← git work happens here
3. Say: "Run quality check"             ← YOU SAY THIS BEFORE OPENING PR
4. ← SKILL 4 RUNS HERE →               npm run lint executes
5. All issues reported and fixed        ← CSS errors, ESLint errors caught
6. Open PR on GitHub                    ← only after Skill 4 says OK
7. Merge to main
```

> **Rule:** Every single PR — no exceptions. Say "run quality check" before going to GitHub to open a PR.

---

## Planned Agent (not yet built)

### `aem-cf-agent` ⏳
**What it will do:** Create Content Fragment Models, CF instances, and persisted GraphQL queries on AEM Author — via REST API, no browser needed.

**Status:** Not yet built. XA6 was completed manually in the AEM Author browser UI.

**When to build it:** When repeating XA6-type work in the real project — creating many CF models or instances. The agent makes it repeatable and error-free.

**What it will need:**
- `.env` file at repo root with `AEM_USER` and `AEM_PASSWORD` (never committed to git)
- Config file `scripts/cf-config.json` with the CF model + state data
- AEM Author URL: `https://author-p153710-e1614654.adobeaemcloud.com`

---

## Skills & Agents — Automation Strategy

### Why build Skills/Agents for this project

AEM Author UI operations (creating Content Fragment models, CF instances, persisted queries, page creation) require manual browser clicks. These are repetitive, time-consuming, and error-prone. A Claude Code Skill or Agent can replace these manual steps by calling AEM REST APIs directly — **no browser needed**.

**Rule:** If an AEM task is repeatable (same steps, different data), build a Skill/Agent for it first. Then use the agent instead of the UI.

---

### AEM REST API Auth

AEM Author always requires authentication — even on sandbox/trial instances (returns `401` without credentials).

```
AEM Author:  https://author-p153710-e1614654.adobeaemcloud.com  → 401 (needs auth)
AEM Publish: https://publish-p153710-e1614654.adobeaemcloud.com → public (no auth)
```

**Auth pattern for agents:**
- Store credentials in `.env` file at repo root (never committed — already in `.gitignore`)
- Agent reads `AEM_USER` and `AEM_PASSWORD` from env vars
- All `curl` calls use `-u $AEM_USER:$AEM_PASSWORD`

---

### XA1–XA6 Automation Opportunity Analysis

| Activity | Manual Task | Can be Automated? | Agent Type |
|---|---|---|---|
| XA1 — Create page | Click in AEM Sites UI | ✅ Yes | AEM Sites REST API |
| XA2 — State Selector | Hardcoded JS array | ✅ Yes | CF instances → GraphQL fetch |
| XA3 — CTA Banner | Set fields in UE | ✅ Partial | AEM Assets API |
| XA4 — Header nav | Edit `/nav` doc in Author | ✅ Partial | JCR write API |
| XA5 — Footer | Edit `/footer` doc in Author | ✅ Partial | JCR write API |
| XA6 — CF + GraphQL | Create model, instances, query | ✅ Yes | CF REST API + GraphQL persist API |

---

### Skills We Still Need to Build

| Skill/Agent | Purpose | Status |
|---|---|---|
| `aem-cf-agent` | Create CF Models, CF instances, persisted GraphQL queries via REST API | ⏳ Planned |
| `global-search-skill` | Build and configure EDS search index + search block | ⏳ Planned for Global Search task |
