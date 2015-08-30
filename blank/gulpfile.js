var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var rename = require('gulp-rename');
var sh = require('shelljs');
var bowerFiles = require('main-bower-files');
var inject = require('gulp-inject');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var es = require('event-stream');
var debug = require('gulp-debug');

var paths = {
    sass: ['./scss/**/*.scss'],
    app: ['./js/**/*.js', './css/**/*.css'],
    html: ['./www/**/*.html']
};

gulp.task('serve', serve);
gulp.task('wiredep', wiredep);
gulp.task('wireref', wireref);
gulp.task('sass', sass);
gulp.task('watch', watch);
gulp.task('minifyHtml', minifyHtml);
gulp.task('default', ['sass', 'serve', 'watch']);


function minifyHtml() {
    var options = {
        conditionals: true,
        spare: true
    }
    gulp.src(paths.html)
        .pipe(minifyHtml(options))
        .pipe(gulp.dest('./dist'));
}


function watch() {
    gulp.watch(paths.sass, ['sass'], reload);
}

function serve() {
    browserSync({
        server: {
            baseDir: 'www'
        }
    });
    gulp.watch(['./www/*.html', './www/js/**/*.js', './www/css/**/*.css', '.scss/*.scss'], reload);
}


function wiredep() {
    gulp.src('./www/index.html')
        .pipe(inject(gulp.src(bowerFiles(), {
            read: false,
            cwd: 'www'
        }), {
            name: 'bower'
        }))
        .pipe(inject(es.merge(
            gulp.src(['./lib/**/*.min.js', '!./lib/**/*ionic-angular.min.js'], {
                read: true,
                cwd: 'www'
            })
        )))
        .pipe(gulp.dest('./www'));
}

function wireref() {
    var target = gulp.src('./www/index.html');
    var sources = gulp.src(paths.app, {
        read: false
    });

    gulp.src('./www/index.html').pipe(inject(es.merge(gulp.src(paths.app, {
        read: false,
        cwd: 'www'
    })), {
        starttag: '<!-- angular:{{ext}} -->'
    }))
        .pipe(gulp.dest('./www'));
}



function sass(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
}