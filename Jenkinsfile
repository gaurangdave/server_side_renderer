@Library('aarnam-shared-library')_
pipeline {
  agent any
  tools {
    nodejs "Node_8_9_3"
  }
  stages {
    stage('setup') {
      steps {
        sh '''
          node -v
          npm -v
          npx -v
          git --version

          git config --global user.name "Jarvis"
          git config --global user.name "jarvis@aarnamsoftwares.com"            

          npm install
          rm package-lock.json
        '''
      }
    }
    stage('test'){
      parallel {
        stage('ESLint') {
          steps {
            sh 'npm run lint'
          }
        }      
        stage('Testing') {
          steps {
            sh 'npm run test'
          }
        }       
      }
    }
  }
  post {
        always {
	          /* Use slackNotifier.groovy from shared library and provide current build result as parameter */   
            slackNotifier(currentBuild.currentResult)
        }
    }
}