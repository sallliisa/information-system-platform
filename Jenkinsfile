node {
    checkout scm
    docker.image('node').inside('-u root') {
        sh 'echo "Building"'
        sh 'npm install'
        sh 'npm run build'
    }
    
    docker.image('sergeyfast/alpine-rsync:latest').inside('-u root') {
        sshagent (credentials: ['ssh-dev']) {
            sh 'mkdir -p ~/.ssh'
            sh 'ssh-keyscan -H "pttas.net" > ~/.ssh/known_hosts'
            sh "rsync -rav --delete ./dist/ zidan@pttas.net:/home/zidan/iso-adhi.pttas.net/public/ --exclude=index.php --exclude=.htaccess --exclude=favicon.ico --exclude=system-assets"
            sh "ssh zidan@pttas.net 'mv /home/zidan/iso-adhi.pttas.net/public/index.html /home/zidan/iso-adhi.pttas.net/resources/views/home.blade.php'"
        }
    }
}
