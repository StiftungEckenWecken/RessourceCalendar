module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            options: {},
            dist: {
                options: {
                    // outputStyle: 'compressed',
                    sourceMap: true
                },
                files: {
                    'src/css/resourceCal.css': 'src/css/resourceCal.scss'
                }
            }
        },

        watch: {
            grunt: {
                options: {
                    reload: true
                },
                files: ['Gruntfile.js']
            },

            sass: {
                files: 'src/scss/**/*.scss',
                tasks: ['sass', 'postcss:dist']
            }
        },

        cssmin: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'app/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'app/css',
                    ext: '.min.css'
                }]
            }
        },
        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')
                ]
            },
            dist: {
                src: 'src/css/*.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('build', ['sass', 'postcss:dist']);
    grunt.registerTask('default', ['build', 'watch']);
}
