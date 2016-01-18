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

};