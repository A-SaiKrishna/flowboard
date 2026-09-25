# GitHub Actions Notes — Fyno CTO Prep
**Sessions:** Fri PM · Hands-on: flowboard CI · Read: Sortment `main-sortment-gke.yml`

---

## 1. What problem does CI solve?

When code changes, we need automatic checks (install, lint, test, build) so broken code is caught early — not only on someone’s laptop.

**CI = Continuous Integration** = automatically run those checks on code changes.

---

## 2. What is GitHub Actions?

GitHub’s CI tool.

On a GitHub **event** (push, PR, manual button), it runs steps we defined in a YAML file under `.github/workflows/`.

```text
You push / open PR
  → GitHub Actions starts on a runner (remote machine)
    → checkout, install, build, docker build…
      → pass ✅ or fail ❌
```

---

## 3. Three core words

| Word | Meaning |
|---|---|
| **on** | When to run (push, pull_request, workflow_dispatch) |
| **jobs** | Units of work |
| **steps** | Commands inside a job, in order |

`runs-on: ubuntu-latest` = which machine runs the job.

Two step types:
- `uses:` = ready-made action (e.g. checkout)
- `run:` = your shell command

Each step in the list needs a `-`:

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4
```

---

## 4. What checkout does

Runner starts **empty**.  
`actions/checkout` = clone this repo onto the runner so later steps have your files.

---

## 5. Secrets

Don’t put passwords in YAML.

Use `${{ secrets.NAME }}` from GitHub Secrets / Environments.  
Same idea as Docker: inject at run time.

---

## 6. Sortment deploy path (ours — not Lightdash Docker Hub)

**File:** `.github/workflows/main-sortment-gke.yml`

**When:** push to `main` or `workflow_dispatch` (manual).

**Flow:**

```text
Check-Changed-Sources
  → rotate-secret (refresh K8s / admin secrets)
  → build_image (Docker → GCP Artifact Registry us-sortment)
  → deploy jobs
```

### build_image (simple)
- checkout
- login GCP (`us-sortment`)
- `docker build` + **push** to  
  `us-central1-docker.pkg.dev/us-sortment/sortment-build/sortment:…`
- only if relevant files changed (`packages`, `dockerfile`, lockfile, …)

### One image → many services
Same Docker image, many containers:

| Service | Where | Role |
|---|---|---|
| `prod-sortment` | **Cloud Run** (`_cloudrun_deploy.yml`) | Main API / web |
| `demo-sortment` / events | Cloud Run | Other app flavors |
| schedulers, temporal, event-consumer | **K8s + Helm** (`_sortment_deploy.yml`) | Background workers |

**How API vs scheduler differ:** same image, different **env flags** at start  
(e.g. `SCHEDULER_ENABLED=true/false`). Same program, different mode.

**How they coordinate:** mostly **same database** (API writes, scheduler reads/processes). Also queues (Temporal/Kafka) when used.

**Cloud Run** = Google runs your container (good for HTTP API).  
**K8s** = cluster that runs many containers; **Helm** = helper to deploy/update on K8s.

**GKE** in the workflow name = Google Kubernetes Engine (Google’s K8s).

**Honesty:** I didn’t write these workflows; I’ve read and can explain them.

Ignore for “our prod story”: `build-docker.yml` → Docker Hub `lightdash/...` (upstream-style).

---

## 7. Hands-on you did — flowboard CI

**Repo:** `github.com/A-SaiKrishna/flowboard`  
**File:** `.github/workflows/ci.yml`

```yaml
name: Flowboard UI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: docker/setup-buildx-action@v3
      - run: docker build -t flowboard:ci .
```

Remember: `docker build -t name .` needs the final **`.`**

Free tier: build without push is fine for learning.

`mkdir -p` = create parent folders if needed.

---

## 8. Link Docker ↔ Actions

| Docker (local) | Actions (CI) |
|---|---|
| You run `docker build` on Mac | Runner runs `docker build` |
| Image on OrbStack | Sortment: push image to **GCP us-sortment** |
| `docker run` locally | Cloud Run / K8s run containers in prod |

---

## 9. CTO short answers

**What is GitHub Actions?**  
CI on GitHub: on events, run jobs/steps (install, test, build, deploy).

**Sortment ship path?**  
Push main → build one image to GCP → deploy API on Cloud Run and workers on K8s/Helm from same image with different env; they share the DB.

**What did you build yourself?**  
flowboard workflow: pnpm install/build + docker build on every push/PR.

---

## 10. Progress

- Docker: Can implement + explain  
- GitHub Actions: Can implement + explain  
- Next: Vitest / Cypress (Saturday) · pnpm / RQ / Vite (clarity)
