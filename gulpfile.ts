import gulp, { src, dest, series, parallel } from 'gulp';
import livereload from 'gulp-livereload';
import run from 'gulp-run';
import sass from 'gulp-sass';

import checkNode from 'check-node-version';
import del from 'del';
import pump from 'pump';

function scss(done) {
    pump([
        src('assets/styles/*.scss'),
        sass({ compressed: true }).on('error', sass.logError),
        dest('assets/build/'),
        livereload()
    ], done);
}

function hbs(done) {
    pump([
        src(["*.hbs"]),
        livereload()
    ], done);
}

function build(done) {
    return scss(done); // TODO: add JS serially
}

function serve(done) {
    livereload.listen();
    done();
}

const _watchScss = () => gulp.watch('assets/styles/*.scss', scss);
const _watchHbs = () => gulp.watch('*.hbs', hbs);
const watch = parallel(_watchScss, _watchHbs);
// const watch = _watchScss;

function restartGhost() {
    return run("ghost restart", { cwd: "../../../" }).exec();
}

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

gulp.task('build', build);
gulp.task('default', series([checkNodeVersion, clean, build, serve, watch]));