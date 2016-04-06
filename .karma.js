module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'build/jaspy.js',
            'spec/*.js'
        ],
        browsers: ['PhantomJS'],
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: {'build/jaspy.js': ['coverage']},
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/',
            subdir: '.'
        },
        browserNoActivityTimeout: 60000
    });
};