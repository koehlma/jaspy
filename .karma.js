module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'spec/javascripts/support/function-bind.js',
            'build/jaspy.js',
            'spec/*.js'
        ],
        browsers: ['Firefox'],
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