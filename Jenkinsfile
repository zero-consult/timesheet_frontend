pipeline {
    agent none
    stages {
        stage('Build build image') {
            agent any
            steps {
                script {
                    docker.build('alpine-npm-jdk:latest', 'docker-images/npm-jdk/')
                }
            }
        }
		stage('Tag version') {
		    agent {
                docker { image 'node:latest' }
            }
			when {
				allOf {
					anyOf {
						branch 'production'
						branch 'testing'
						branch 'development'
					}
					expression {
						return !isVersionTag(readCurrentTag())
					}
				}
			}
			steps {
			    sh "mkdir -p ~/.ssh"
                sh "ssh-keyscan github.com > ~/.ssh/known_hosts"
                script {
                    withCredentials([
                        sshUserPrivateKey(
                            credentialsId: 'MathiasVE',
                            keyFileVariable: 'keyFile'
                        )
                    ]) {
                        sshKey = readFile(keyFile).trim()
                    }
                }
                sh 'touch ~/.ssh/id_rsa'
                sh 'chmod 600 ~/.ssh/id_rsa'
                sh '#!/bin/sh -e\n' + "echo '${sshKey}' > ~/.ssh/id_rsa"
                sh 'chmod 400 ~/.ssh/id_rsa'
				script {
					def tagName = sh(script: "git describe --tags --always HEAD^1 || echo 'no-tag'", returnStdout: true).trim()
                    def tagMatcher = tagName =~ /\d+\.\d+\.\d+/
					if (!tagMatcher.matches()) {
						env.TAG_NAME = '1.0.0'
					} else {
						env.TAG_NAME = tagName;
					}
					echo tagName
					def versionParts = env.TAG_NAME.tokenize('.')
					env.MAJOR_VERSION = versionParts[0].toInteger()
					env.MINOR_VERSION = versionParts[1].toInteger()
					env.PATCH_VERSION = versionParts[2].toInteger()
					if (tagName ==~ /\d+\.\d+\.\d+/) {
						env.PATCH_VERSION = env.PATCH_VERSION.toInteger() + 1
					}
				}
                sh "git config --global user.email 'mathias.ver.elst@gmail.com'"
                sh "git config --global user.name 'Jenkins'"
                sh "git tag -a ${env.MAJOR_VERSION}.${env.MINOR_VERSION}.${env.PATCH_VERSION} -m '${env.MAJOR_VERSION}.${env.MINOR_VERSION}.${env.PATCH_VERSION}'"
                sh "GIT_SSH='ssh -i ~/.ssh/id_rsa'"
                sh "git push git@github.com:zero-consult/people_frontend.git ${env.MAJOR_VERSION}.${env.MINOR_VERSION}.${env.PATCH_VERSION}"
			}
		}
		stage('Build') {
		    agent {
                docker { image 'alpine-npm-jdk:latest' }
            }
            steps {
				script {
					version = readCurrentTag()
				}
			    sh "sed -i 's/\"version\": \"0.0.0\"/\"version\": \"$version\"/' package.json"
			    sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {
            agent {
                 docker { image 'alpine-npm-jdk:latest' }
            }
            steps {
                sh 'npm test'
            }
        }
		stage('Push image') {
		    agent any
			steps {
				script {
                    def TAG = readCurrentTag()
				    echo "pushing image"
				    docker.withRegistry('http://nexus:8081', 'Nexus') {
				        if(env.BRANCH_NAME != "production") {
				            app = docker.build("docker-releases/people_frontend_${env.BRANCH_NAME}:$TAG")
                            app.push("$TAG")
				        } else {
                            app = docker.build("docker-releases/people_frontend:$TAG")
                            app.push("$TAG")
                        }
                    }
				}
			}
		}
    }
}

def boolean isVersionTag(String tag) {
    echo "checking version tag $tag"

    if (tag == null) {
        return false
    }

    def tagMatcher = tag =~ /\d+\.\d+\.\d+/

    return tagMatcher.matches()
}

def String readCurrentTag() {
    return sh(returnStdout: true, script: "git tag --points-at HEAD").trim()
}