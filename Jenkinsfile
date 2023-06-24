node(){
    stage('Cloning Git') {
        checkout scm
    }
    stage('Install dependencies') {
        nodejs('nodejs') {
            sh 'npm install'
            echo "Modules installed"
            sh 'npm install -g @nestjs/cli'
            echo "nestJs CLI"
        }
        
    }
    stage('Build') {
        nodejs('nodejs') {
            sh 'nest build'
            echo "Build completed"
        }
        
    }

    stage('Package Build') {
        sh "tar -zcvf bundle.tar.gz dist/ package.json"
    }

    stage('Artifacts Creation') {
        fingerprint 'bundle.tar.gz'
        archiveArtifacts 'bundle.tar.gz'
        echo "Artifacts created"
    }

    stage('Stash changes') {
        stash allowEmpty: true, includes: 'bundle.tar.gz', name: 'buildArtifacts'
    }
}

node('backendNode') {
    echo 'Unstash'
    unstash 'buildArtifacts'
    echo 'Artifacts copied'

    echo 'Delete old files'
    sh 'cd /home/dist && sudo pm2 kill && rm * -f;'
    echo 'Main.js stopped and files deleted'

    echo 'Copy'
    sh "yes | sudo cp -R bundle.tar.gz /home && cd /home && sudo tar -xvf bundle.tar.gz"
    echo 'Copy completed'

    echo 'Install packages'
    sh "cd /home/dist && sudo npm i && ls -a"
    echo 'Packages installed'

    echo 'Run Application'
    sh "cd /home/dist && pm2 stop main.js && pm2 start main.js && pm2 status"
    echo 'Application is running'
}