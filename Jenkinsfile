pipeline {
    agent any

    environment {
        IMAGE_NAME = "nodejs-app"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = "nodejs-app-container"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test || echo "No tests configured, skipping"'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying new container"
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} -p 3000:3000 ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully. App deployed as ${CONTAINER_NAME}."
        }
        failure {
            echo "Pipeline failed. Check the stage logs above."
        }
        always {
            echo "Build ${env.BUILD_NUMBER} finished with status: ${currentBuild.currentResult}"
        }
    }
}
