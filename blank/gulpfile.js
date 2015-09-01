var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concatJS = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var sassToCss = require('gulp-sass');
var compressCss = require('gulp-minify-css');
var compressHtml = require('gulp-minify-html');
var rename = require('gulp-rename');
var sh = require('shelljs');
var bowerFiles = require('main-bower-files');
var inject = require('gulp-inject');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var es = require('event-stream');
var debug = require('gulp-debug');
var uglify = require('gulp-uglify');
var cleanBuild = require('gulp-clean');
var gulpBower = require('gulp-bower');
var jeditor = require("gulp-json-editor");
var ngAnnotate = require('gulp-ng-annotate');


var paths = {
    sass: ['./scss/**/*.scss'],
    app: ['./js/**/*.js', './css/**/*.css'],
    html: ['./app/**/*.html'],
    js: ['./app/js/**/*.js'],
    css: ['./app/css/**/*.css'],
    work: './app',
    build: './www'
};

gulp.task('serve', serve);
gulp.task('wiredep', ['wireref'], wiredep);
gulp.task('wireref', wireref);



gulp.task('sass', sass);
gulp.task('watch', watch);
gulp.task('minifyHtml', ['clean'], minifyHtml);
gulp.task('minifyJS', ['bowerUpdateFiles'], minifyJS);
gulp.task('minifyCss', ['bowerUpdateFiles'], minifyCss);
gulp.task('bowerUpdateFiles', ['clean'], bowerUpdateFiles);
gulp.task('changePathToBuild', changePathToBuild)
gulp.task('changePathToWork', changePathToWork);
gulp.task('clean', clean);
gulp.task('wirerefProd', ['minifyHtml', 'minifyCss', 'minifyJS', 'bowerUpdateFiles'], wirerefProd);
gulp.task('wiredepProd', ['wirerefProd'], wiredepProd);
gulp.task('build', ['wiredepProd'], build);

gulp.task('default', ['sass', 'serve', 'watch']);



function build() {
    console.log('building complete!')
}


function changePathToBuild() {
    return gulp.src("./ionic.project")
        .pipe(jeditor({
            'documentRoot': paths.build
        }))
        .pipe(gulp.dest("./"));
}

function changePathToWork() {
    return gulp.src("./ionic.project")
        .pipe(jeditor({
            'documentRoot': paths.work
        }))
        .pipe(gulp.dest("./"));
}

function bowerUpdateFiles() {
    return gulp.src(paths.work + '/lib/**/*')
        .pipe(gulp.dest(paths.build + '/lib'))
}


function clean() {
    return gulp.src(paths.build, {
            read: false
        })
        .pipe(cleanBuild());
}

function minifyJS() {
    return gulp.src(paths.js)
        .pipe(ngAnnotate())
        .pipe(concatJS('server.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.build + '/js'))
}

function minifyCss() {
    return gulp.src(paths.css)
        .pipe(debug())
        .pipe(concatCss('main.css'))
        .pipe(compressCss())
        .pipe(gulp.dest(paths.build + '/css'))
}

function minifyHtml() {
    var options = {
        conditionals: true,
        spare: true,
        comments: true,
        loose: true,
        cdata: true,
        quotes: true
    }
    return gulp.src(paths.html)
        .pipe(debug())
        .pipe(compressHtml(options))
        .pipe(gulp.dest(paths.build));
}


function watch() {
    gulp.watch(paths.sass, ['sass'], reload);
}

function serve() {
    changePathToWork();
    browserSync({
        server: {
            baseDir: 'app'
        }
    });
    gulp.watch(['./app/*.html', './app/js/**/*.js', './app/css/**/*.css'], reload);
    watch();
}


function wirerefProd() {
    return gulp.src('./www/index.html')
        .pipe(inject(es.merge(gulp.src(paths.app, {
            read: true,
            cwd: 'www'
        })), {
            starttag: '<!-- angular:{{ext}} -->',
            addRootSlash: false
        }))
        .pipe(gulp.dest('./www'));
}

function wiredepProd() {
    return gulp.src('./www/index.html')
        .pipe(inject(gulp.src(bowerFiles(), {
            read: false
        }), {
            name: 'bower',
            relative: true,
            addRootSlash: false
        }))
        .pipe(inject(es.merge(
            gulp.src(['./lib/**/*.min.js', '!./lib/**/*ionic-angular.min.js'], {
                cwd: 'www'
            })
        ), {
            addRootSlash: false
        }))
        .pipe(gulp.dest('./www'));
}


function wiredep() {
    return gulp.src('./app/index.html')
        .pipe(inject(gulp.src(bowerFiles(), {
            read: false
        }), {
            name: 'bower',
            relative: true,
            addRootSlash: false
        }))
        .pipe(inject(es.merge(
            gulp.src(['./lib/**/*.min.js', '!./lib/**/*ionic-angular.min.js'], {
                cwd: 'app'
            })
        ), {
            addRootSlash: false
        }))
        .pipe(gulp.dest('./app'));
}

function wireref() {

    return gulp.src('./app/index.html').pipe(inject(es.merge(gulp.src(paths.app, {
            read: false,
            cwd: 'app'
        })), {
            starttag: '<!-- angular:{{ext}} -->',
            addRootSlash: false
        }))
        .pipe(gulp.dest('./app'));
}



function sass(done) {
    gulp.src('./scss/**/*')
        .pipe(sassToCss({
            errLogToConsole: true
        }))
        .pipe(gulp.dest('./app/css/'))
        .pipe(compressCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./app/css/'))
        .on('end', done);
}