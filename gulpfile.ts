import gulp, { src, dest, series, parallel } from 'gulp';
import livereload from 'gulp-livereload';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import styleAlias from 'gulp-style-aliases';
import zip from 'gulp-zip';

import checkNode from 'check-node-version';
import del from 'del';
import pump from 'pump';

const CSS_PATH = 'assets/styles/**/*.scss';

function copyFontawesomeCss(done) {
    return pump([
        src("node_modules/@fortawesome/fontawesome-free/css/all.min.css"),
        rename('fontawesome.min.css'),
        dest('assets/build/css')
    ], done);
}
function copyFontawesomeFonts(done) {
    return pump([
        src("node_modules/@fortawesome/fontawesome-free/webfonts/**"),
        dest('assets/build/webfonts/')
    ], done);
}
const copyFontAwesome = parallel(copyFontawesomeCss, copyFontawesomeFonts);

function scss(done) {
    pump([
        src(CSS_PATH),
        styleAlias({
            "~": "node_modules/",
        }),
        sass({ outputStyle: 'compressed' }).on('error', sass.logError),
        rename('style.min.css'),
        dest('assets/build/css/'),
        livereload()
    ], done);
}

function hbs(done) {
    pump([
        src(["*.hbs"]),
        livereload()
    ], done);
}

const build = series(copyFontAwesome, scss);

function serve(done) {
    livereload.listen();
    done();
}

const _watchScss = () => gulp.watch(CSS_PATH, scss);
const _watchHbs = () => gulp.watch('*.hbs', hbs);
const watch = parallel(_watchScss, _watchHbs);

function clean() {
    return del("assets/build/");
}

function checkNodeVersion(done) {
    return checkNode({ node: "10.x || 12.x" }, (error, result) => {
        if (error) {
            throw error;
        }
        if (!result.isSatisfied) {
            throw Error("Check your node version to be compatible with Ghost first.");
        }
        done();
    });
}

function zipRelease(done) {
    const p = require('./package.json');
    const filename = `${p.name}-v${p.version}.zip`;
    pump([
        src([
            "**",
            "!node_modules", "!node_modules/**",
            "!dist", "!dist/**"
        ]),
        zip(filename),
        dest('dist/'),
    ], done);
}

gulp.task('build', build);
gulp.task('default', series([checkNodeVersion, clean, build, serve, watch]));
gulp.task('release', series([build, zipRelease]));
