pipeline {
    agent any

    environment {
        IMAGE_NAME = "jenkins-demo"
        CONTAINER_NAME = "jenkins-demo-app"
        APP_PORT = "3000"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
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
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing image to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        docker tag ${IMAGE_NAME}:latest \$DOCKER_USER/${IMAGE_NAME}:latest
                        docker push \$DOCKER_USER/${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                sh """
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} -p ${APP_PORT}:${APP_PORT} ${IMAGE_NAME}:latest
                """
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! App is running.'
        }
        failure {
            echo 'Pipeline failed. Check the logs above for details.'
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}
