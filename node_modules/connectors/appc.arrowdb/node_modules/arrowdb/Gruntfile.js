module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 30000,
				reporter: 'spec',
				ignoreLeaks: false
			},
			src: ['test/**/*.js']
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['*.js','lib/**/*.js','test/**/*.js']
		},
		kahvesi: {
			src: ['test/**/*.js']
		},
		clean: {
			pre: ['*.log'],
			post: ['tmp']
		}
	});

	// Load grunt plugins
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-kahvesi');

	// Register tasks
	grunt.registerTask('default', ['clean:pre', 'jshint', 'mochaTest', 'clean:post']);
	grunt.registerTask('coverage', ['clean:pre', 'kahvesi', 'clean:post']);
};
