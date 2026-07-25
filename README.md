# Jenkins CI/CD Pipeline Demo — Node.js App

## Objective
Set up a basic Jenkins pipeline that automatically builds, tests, and deploys
a simple Node.js web app using Docker, triggered on each code commit.

## Tools Used
- Jenkins
- Docker
- Node.js (Express)
- Jest + Supertest (testing)

## Project Structure
```
jenkins-demo/
├── Jenkinsfile        # Pipeline definition
├── app.js             # Express server
├── app.test.js        # Unit tests
├── package.json
├── Dockerfile
└── .dockerignore
```

## Pipeline Stages (defined in `Jenkinsfile`)
1. **Checkout** — pulls the latest code from the repo.
2. **Install Dependencies** — runs `npm install`.
3. **Test** — runs `npm test` (Jest).
4. **Build Docker Image** — builds the app into a Docker image (`jenkins-demo:latest`).
5. **Push to Docker Hub** — logs in using stored credentials and pushes the
   image to Docker Hub.
6. **Deploy** — stops any previous running container and starts a new one from
   the freshly built image, exposing it on port 3000.

## Setup Steps (what I did)

### 1. Install Jenkins
- **Locally (Docker):**
  ```bash
  docker run -d -p 8080:8080 -p 50000:50000 \
    -v jenkins_home:/var/jenkins_home \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --name jenkins jenkins/jenkins:lts
  ```
- Or use a cloud instance (AWS EC2, DigitalOcean droplet, etc.) and install
  Jenkins via the official install script for your OS.
- Visit `http://localhost:8080` (or your server IP), unlock Jenkins using the
  initial admin password (`docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`),
  and install the suggested plugins.

### 2. Install required plugins
- **Docker Pipeline** plugin (lets Jenkins run `docker` commands in stages).
- **NodeJS** plugin (optional, if you want Jenkins to manage the Node version
  instead of relying on a Node install on the host/agent).
- **GitHub Integration / GitHub** plugin (for webhook-triggered builds).

### 3. Give Jenkins access to Docker
If running Jenkins itself in Docker, mount the Docker socket (see command
above) so Jenkins can build/run containers on the host.

### 4. Create the pipeline job
- New Item → **Pipeline** (or **Multibranch Pipeline** if you want automatic
  builds for every branch/PR).
- Under **Pipeline → Definition**, choose **Pipeline script from SCM**.
- Set **SCM** to Git, point it at this repo's URL, and set the script path to
  `Jenkinsfile`.

### 5. Add Docker Hub credentials
- **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**
- Kind: **Username with password**
- Username: your Docker Hub username
- Password: a Docker Hub access token (Docker Hub → Account Settings →
  Security → New Access Token, scope: Read & Write)
- ID: `dockerhub-creds` (must match the `credentialsId` used in the Jenkinsfile)

### 6. Configure trigger on commit
- **Option A — Webhook:** requires Jenkins to be publicly reachable (cloud
  server, or `ngrok` tunnel for local testing). In GitHub: **Settings →
  Webhooks → Add webhook**, payload URL `http://<your-jenkins-url>/github-webhook/`,
  content type `application/json`, event "Just the push event." In Jenkins,
  enable **"GitHub hook trigger for GITScm polling"** under Build Triggers.
- **Option B — Poll SCM (used in this project, since Jenkins runs locally):**
  Job → **Configure → Build Triggers → Poll SCM**, schedule `* * * * *`
  (checks every minute). Jenkins runs `git fetch` on this schedule and only
  builds if new commits are found. This is the simpler option when Jenkins
  isn't publicly reachable — a webhook would trigger instantly in a
  production/cloud setup instead.

### 6. Run and verify
- Push a commit to the repo.
- Watch the job trigger automatically in the Jenkins dashboard (or click
  **Build Now** to test manually the first time).
- Confirm all 5 stages go green, then check `http://localhost:3000` to see the
  running app.

## Running Locally (without Jenkins)
```bash
npm install
npm test
npm start                     # http://localhost:3000

# or with Docker directly
docker build -t jenkins-demo .
docker run -p 3000:3000 jenkins-demo
```

## Notes / Learnings
- The `Jenkinsfile` uses a **declarative pipeline** (`pipeline { agent any ... }`),
  which is simpler to read than a scripted pipeline for straightforward builds.
- Mounting the Docker socket into the Jenkins container is the easiest way to
  let Jenkins build/run Docker images without installing Docker-in-Docker.
- Webhooks give near-instant triggering; polling is a simpler fallback when
  your Jenkins instance isn't publicly reachable from GitHub.
- The `post` block ensures clear success/failure messaging regardless of which
  stage fails.

## Pipeline Status
✅ Latest run: **Finished: SUCCESS**
- Checkout → Install Dependencies → Test (2/2 passed) → Build Docker Image →
  Push to Docker Hub → Deploy — all stages green.
- Image live on Docker Hub as `jstech06/jenkins-demo:latest`.
- App running locally at `http://localhost:3000` (health check at `/health`).
- Jenkins runs natively on Windows, so the Jenkinsfile uses `bat` steps
  instead of `sh`, and Windows-style `%VAR%` syntax instead of `${VAR}`
  inside those blocks.

### Issues encountered & fixed (for anyone reviewing this repo)
1. **Git fetch failed — `couldn't find remote ref refs/heads/master`.**
   Jenkins was configured to build `*/master`, but the repo's default branch
   is `main`. Fixed under Job → Configure → Pipeline → SCM → Branches to
   build → changed to `*/main`.
2. **`Cannot run program "sh"` error.**
   Jenkins was running on native Windows (not Linux/Docker), so Bash-style
   `sh` steps don't exist. Replaced every `sh` step with `bat`, and swapped
   `${VAR}` references for `%VAR%` inside those blocks.
3. **`'npm' is not recognized...`**
   Node.js wasn't installed on the Windows machine at all. Installed the LTS
   version from nodejs.org, then restarted the Jenkins service so it picked
   up the updated system PATH.
4. **`'docker' is not recognized...`**
   Same root cause as above — Docker wasn't installed yet. Installed Docker
   Desktop for Windows.
5. **Docker Desktop — "Virtualization support not detected."**
   Caused by missing Windows features, not just BIOS virtualization (which
   was already enabled). Fixed by enabling **Virtual Machine Platform** and
   **Windows Subsystem for Linux** under `optionalfeatures`, running
   `wsl --update`, and restarting the PC.
6. **`docker` still not recognized inside Jenkins after installing Docker Desktop.**
   Jenkins runs as a Windows **service**, which uses the **System** PATH, not
   the logged-in user's PATH. Found Docker's CLI location via `where docker`
   and added it to **System variables → Path** (Control Panel → System →
   Advanced → Environment Variables), then restarted the Jenkins service.

Each of these is a common real-world Jenkins-on-Windows setup issue, not a
problem with the pipeline logic itself — the `Jenkinsfile` stages were correct
throughout; the environment just needed the right tools installed and visible
to the Jenkins service.
 || Successful Done ||