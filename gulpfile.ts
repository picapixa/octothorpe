const {series, watch, src, dest, parallel} = require('gulp');
const pump = require('pump');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const zip = require('gulp-zip');
const uglify = require('gulp-uglify');
const beeper = require('beeper');

// postcss plugins
const autoprefixer = require('autoprefixer');
const colorFunction = require('postcss-color-mod-function');
const cssnano = require('cssnano');
const easyimport = require('postcss-easy-import');

const tailwind = require('tailwindcss');
const tailwindNesting = require('tailwindcss/nesting');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    const processors = [
        easyimport,
        colorFunction(),
        tailwindNesting(),
        tailwind(),
        autoprefixer(),
        cssnano()
    ];

    pump([
        src('assets/css/*.css', {sourcemaps: true}),
        postcss(processors),
        dest('assets/build/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        src('assets/js/*.js', {sourcemaps: true}),
        uglify(),
        dest('assets/build/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    const targetDir = 'dist/';
    const themeName = require('./package.json').name;
    const filename = themeName + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**'
        ]),
        zip(filename),
        dest(targetDir)
    ], handleError(done));
}

const cssWatcher = () => watch('assets/css/**', css);
const hbsWatcher = () => watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, hbsWatcher);
const build = series(css, js);
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;
