# Vitest Notes — Fyno CTO Prep
**Hands-on:** flowboard (`src/store.test.ts`) · Also saw: datagrid-kit tests

---

## 1. What problem?

You change a small piece of code (helper, sort, label…).

Without tests: click UI every time, easy to miss bugs.

**Unit test** = automatic check of a **small piece** of code.

---

## 2. What is Vitest?

Test runner that works great with **Vite** projects.

```text
code + test file → pnpm test (vitest run) → pass ✅ / fail ❌
```

(Older common tool: Jest — same idea, different runner.)

---

## 3. Vitest vs Cypress

| Vitest | Cypress |
|---|---|
| Small units, fast | Bigger e2e / API flows |
| Functions, components | Real browser or HTTP API |

Both useful. Different jobs.

---

## 4. Three words

```ts
import { describe, it, expect } from 'vitest'
```

| Word | Meaning |
|---|---|
| `describe` | Group of related tests |
| `it` | One test case |
| `expect` | Assert the result |

Matchers you used:
- `.toBe('Start')` — exact value
- `.toEqual([...])` — deep compare (objects/arrays)
- `.toHaveLength(n)` — length check

---

## 5. Setup on flowboard (what you did)

1. `pnpm add -D vitest`
2. `vite.config.ts` — use `vitest/config` + test options:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

3. `package.json`: `"test": "vitest run"`
4. Export something testable (`export const labelFor` from `store.ts`)
5. Write `src/store.test.ts`
6. Run `pnpm test`
7. CI: `run: pnpm test` in `.github/workflows/ci.yml`

---

## 6. Your flowboard test (idea)

```ts
import { describe, it, expect } from 'vitest'
import { labelFor } from './store'

describe('labelFor', () => {
  it('returns Start for start', () => {
    expect(labelFor('start')).toBe('Start')
  })
  it('returns Action for action', () => {
    expect(labelFor('action')).toBe('Action')
  })
})
```

`labelFor` maps node types → default labels in the flow builder.

---

## 7. Interview one-liner

> I use Vitest for unit tests in Vite apps. On flowboard I exported a pure helper, wrote describe/it/expect tests, run them with pnpm test, and added that step to GitHub Actions. At work we also have Vitest in the monorepo; I can read and extend those tests.

---

## 8. Progress

- Docker ✅ · Actions ✅ · pnpm ✅ · Vitest ✅  
- Next: Cypress
