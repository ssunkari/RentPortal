'use strict';

module.exports = function (grunt) {
    process.env.ERROR_FILE = 'error.log';

    grunt.initConfig({
        pkg: grunt.file.readJSON('./package.json'),

        // Configure a mochaTest task
        mochaTest: {
            unitTest: {
                options: {
                    reporter: 'spec',
                },
                src: ['test/**/*.js']
            }
        },
        jscs: {
            src: 'src/**/*.js',
            options: {
                config: '.jscs.json'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            lib: {
                src: ['src/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        watch: {
            style: {
                files: ['<%= jscs.src %>'],
                tasks: ['jscs']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'test']
            },
            test: {
                files: ['<%= jshint.test.src %>'],
                tasks: ['jshint:test', 'test']
            }
        },
        lineending: {
            dist: {
                options: {
                    overwrite: true,
                    eol: 'lf'
                },
                files: {
                    lib: ['src/**/*'],
                    test: ['test/**/*']
                }
            }
        },
        shell: {
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            },
            cloneArtefacts: {
                command: 'git clone <%= artefactGitUrl %> <%= artefactPullLocation %>'
            },
            commitArtefact: {
                command: 'git add -A && git commit -m \'v<%= pkg.version %><%= artefactTag %>\'',
                options: {
                    execOptions: {
                        cwd: '<%= artefactPullLocation %>'
                    }
                }
            },
            tagArtefact: {
                command: 'git tag -a \'<%= artefactTag %>\' -m \'Automated publish.\'',
                options: {
                    execOptions: {
                        cwd: '<%= artefactPullLocation %>'
                    }
                }
            },
            pushArtefact: {
                command: 'git push origin master && git push --tags',
                options: {
                    execOptions: {
                        cwd: '<%= artefactPullLocation %>'
                    }
                }
            },
            clearGit: {
                command: 'rm <%= artefactPullLocation %> -rf'
            },
            clearArtefacts: {
                command: 'rm * -rf',
                options: {
                    execOptions: {
                        cwd: '<%= artefactPullLocation %>'
                    }
                }
            },
            copyApplication: {
                command: [
                    'cp -r <%= rateserviceDist %>/package.json <%= artefactPullLocation %>',
                    'cp -r <%= rateserviceDist %>/src/* <%= artefactPullLocation %>',
                    'cp -r <%= rateserviceDist %>./newrelic.js <%= artefactPullLocation %>',
                    'echo \'<%= artefactTag %>\' > <%= artefactPullLocation %>/version.txt'
                ].join('&&'),
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
                }
            },
            prodmodules: {
                command: 'npm install --production',
                options: {
                    execOptions: {
                        cwd: '<%= artefactPullLocation %>'
                    }
                }
            },
            cleanGitIgnores: {
                command: 'find <%= artefactPullLocation %> -name \'.gitignore\' -exec rm {} \\;'
            },
            tar: {
                command: 'tar -czf rateservice.<%= rateserviceVersion %>.tar.gz ./<%= rateserviceDist %>/*'
            }
        }
    });

    // Add the grunt-mocha-test tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-lineending');

    grunt.registerTask('lf', ['lineending']);

    grunt.registerTask('test', ['mochaTest']);

    grunt.registerTask('default', ['jshint', 'jscs', 'test']);

    grunt.registerTask('publish', [
        'shell:clearGit',
        'shell:cloneArtefacts',
        'shell:clearArtefacts',
        'shell:copyApplication',
        'shell:prodmodules',
        'shell:cleanGitIgnores',
        'shell:commitArtefact',
        'shell:tagArtefact',
        'shell:pushArtefact'
    ]);
};