# pnpm workspaces Notes — Fyno CTO Prep

---

## 1. What problem?

One repo with many packages (frontend, backend, common…).

Without workspaces: install separately, copy shared code, messy versions.

**Workspace** = manage many packages in one repo as one team.

---

## 2. The map file

`pnpm-workspace.yaml` lists which folders are packages:

```yaml
packages:
  - 'packages/*'
  - 'packages/frontend/sdk'
```

= everything under `packages/*` is in the workspace.

---

## 3. Common day-to-day commands

From **repo root**:

```bash
pnpm install                 # whole workspace
pnpm -F frontend build       # only frontend
pnpm -F backend test         # only backend
```

`-F` = filter = only that package.

---

## 4. Why `common`?

Shared code (types, helpers) used by frontend AND backend.

**Don’t** copy-paste into both.  
**Do** put it in `packages/common` and both use it.

---

## 5. How common connects (the how)

**Two steps only:**

### A) package.json says “I need common”

frontend and backend both have:

```json
"@lightdash/common": "workspace:*"
```

### B) Code imports it

```ts
import { something } from '@lightdash/common'
```

---

## 6. Split the confusing line

```json
"@lightdash/common": "workspace:*"
```

| Part | Meaning |
|---|---|
| `@lightdash/common` | **Import name** (label). Still “lightdash” because Sortment grew from Lightdash. Real folder = `packages/common` |
| `workspace:*` | Get it from **this local repo workspace**, not download from npm internet |

```text
import '@lightdash/common'
        → pnpm sees workspace:*
        → uses packages/common in Sortment
```

---

## 7. flowboard vs Sortment

| | flowboard | Sortment |
|---|---|---|
| Packages | One | Many (workspace) |
| Needs workspaces? | No | Yes |

---

## 8. Interview one-liner

> Sortment is a pnpm monorepo. `pnpm-workspace.yaml` lists packages. Frontend/backend depend on local `common` via `workspace:*` and import `@lightdash/common` — that’s our shared package folder, not a random npm download. I use `pnpm -F` to run scripts in one package.

---

## 9. Progress

- Docker ✅ · GitHub Actions ✅ · pnpm workspaces ✅  
- Next: Vitest → Cypress
