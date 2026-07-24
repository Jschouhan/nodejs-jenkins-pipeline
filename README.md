Jenkins CI/CD Pipeline Demo — Node.js App
Objective
Set up a basic Jenkins pipeline that automatically builds, tests, and deploys a simple Node.js web app using Docker, triggered on each code commit.
Tools Used
Jenkins
Docker
Node.js (Express)
Jest + Supertest (testing)


Project Structure
jenkins-demo/
├── Jenkinsfile        # Pipeline definition
├── app.js             # Express server
├── app.test.js        # Unit tests
├── package.json
├── Dockerfile
└── .dockerignore

Pipeline Stages (defined in Jenkinsfile)
Checkout — pulls the latest code from the repo.
Install Dependencies — runs npm install.
Test — runs npm test (Jest).
Build Docker Image — builds the app into a Docker image (jenkins-demo:latest).
Deploy — stops any previous running container and starts a new one from the freshly built image, exposing it on port 3000.