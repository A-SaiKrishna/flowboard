# Docker Notes — Fyno CTO Prep
**Session:** Fri night (~2h) · Hands-on: flowboard

---

## 1. What problem does Docker solve?

Same code can fail on different machines (different Node versions, missing libraries).

**Docker** packs the **app + the environment it needs** so it runs the same on laptop, CI, and server.

> Reduces “works on my machine” problems.

**Analogy:** lunch box — meal + everything needed is inside; doesn’t depend on that kitchen.

---

## 2. Image vs Container

| | Image | Container |
|---|---|---|
| What | Blueprint / package (read-only template) | Running instance |
| Analogy | Class | Object |
| Command vibe | `docker build` | `docker run` |

- Delete a **container** → **image still there**
- One image → **many** containers

```text
Dockerfile → docker build → IMAGE → docker run → CONTAINER
```

**`--rm`:** remove the container when it exits (cleanup). Image is not deleted.

**Daemon must be running:** OrbStack/Docker app open.  
Error `Cannot connect to the Docker daemon` = app/daemon not running → open OrbStack.

---

## 3. Dockerfile

Text file of **instructions** to build an image.

| Instruction | When | Meaning |
|---|---|---|
| `FROM` | build | Start from a base image (`node:20-alpine`, `nginx:alpine`) |
| `AS name` | build | Name this **stage** |
| `RUN` | **build** time | Execute command while building (becomes part of image) |
| `CMD` | **run** time | Default command when container starts |
| `WORKDIR /app` | build | Current folder inside image = `/app` |
| `COPY` | build | Copy files from your machine into the image |
| `EXPOSE` | docs | Port the app uses (e.g. 80) |
| `COPY --from=stage` | build | Copy from an **earlier stage** (multi-stage) |

### `node:20` vs `node:20-alpine`
- Official Node 20 image from Docker Hub
- **alpine** = smaller Linux base → smaller image
- Typo `nnode` will fail — must be `node`

### Corepack
Comes with Node. Turns on a specific **pnpm** version inside the image.

```dockerfile
RUN corepack enable
RUN corepack prepare pnpm@9.15.5 --activate
```

### Why copy package files BEFORE full source?

Docker **caches layers**.

1. `COPY package.json pnpm-lock.yaml ./`
2. `RUN pnpm install --frozen-lockfile`
3. `COPY . .`
4. `RUN pnpm build`

If only React code changes → install layer stays **cached** (faster rebuilds).

**`./`** = current WORKDIR (here `/app`)  
**`--frozen-lockfile`** = install exactly from lockfile; don’t change it

### `.dockerignore`
Like `.gitignore` for Docker build context.  
Don’t send `node_modules`, `dist`, `.git` into the build.

---

## 4. Multi-stage (important)

**Not** “do steps at once.”

**Is:** separate named stages. Fat stages **build**; final stage keeps only what you need to **run**.

```text
FROM x AS y     → new stage named y, based on x
                 (x = public image OR earlier stage name)
```

Why: avoid shipping compilers, full `node_modules`, source → smaller, safer image.

---

## 5. Secrets

**Bad:** bake `DB_PASSWORD` into Dockerfile/image  
- Leaks if image is shared  
- Can’t easily use different DBs per env  

**Good:** pass secrets at **run time** (when container starts).  
Same image → staging vs prod different env vars.

Frontend: never put private secrets in browser bundles.

---

## 6. Sortment (this monorepo) — be honest

### Root `dockerfile`
- Multi-stage: `pnpm-base` → `base` → build packages → `prod`
- **Builds** frontend + backend (+ common, warehouses)
- **Runs** backend (`CMD pnpm start`, port **8080**)
- Frontend **build files** are **inside** the image; process that starts is backend

### Which registry is ours?
| Workflow | Where image goes | Whose |
|---|---|---|
| `build-docker.yml` | Docker Hub `lightdash/lightdash` | Upstream / Lightdash-style |
| `main-sortment-gke.yml` etc. | **GCP** `us-sortment/.../sortment` | **Sortment prod path** |

**Interview honesty:**
> I didn’t own CI/Docker. I’ve read our Dockerfile and Sortment deploy path. Prod images go to GCP Artifact Registry (`us-sortment`), not claims of owning Docker Hub lightdash publish.

---

## 7. Hands-on you did — flowboard

**Path:** `~/Documents/projects/flowboard`

**Your Dockerfile idea:**
1. Stage `base`: Node alpine + pnpm → install → build → `dist/`
2. Stage `prod`: nginx alpine → copy `dist` → serve

**nginx (simple):** web server that gives HTML/JS/CSS to the browser.  
**`daemon off`:** keep nginx in foreground so the **container stays running**.

**Commands:**
```bash
# OrbStack must be open
cd ~/Documents/projects/flowboard

docker build -t flowboard:local .
docker run --rm -p 8080:80 flowboard:local
```

Open: **http://localhost:8080/**  
(Not `/login` — flowboard has no login; nginx 404 if file doesn’t exist)

| Flag | Meaning |
|---|---|
| `-t flowboard:local` | tag/name the image |
| `.` | build context = this folder |
| `-p 8080:80` | Mac port 8080 → container port 80 |

```text
Dockerfile → image (flowboard:local) → container → browser
```

---

## 8. CTO-ready short answers

**What is Docker?**  
Tool to run the same app with the same environment everywhere.

**Image vs container?**  
Image = blueprint; container = running instance.

**Multi-stage?**  
Build in heavy stages; copy only artifacts into a small final stage that runs.

**Secrets?**  
Don’t bake into image; inject at run time.

**Sortment?**  
Multi-stage Dockerfile builds monorepo (incl. FE assets); prod container runs backend; Sortment ships images to GCP `us-sortment`. I can explain it; I didn’t author the pipeline.

---

## 9. Progress

- Docker: **Can implement + explain** (flowboard hands-on done)
- GitHub Actions: **next session**
- Claim bar: know / used / can explain — **not** “I owned Sortment Docker/CI”
