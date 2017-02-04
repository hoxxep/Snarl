var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    zip = require('gulp-zip'),
    less = require('gulp-less'),
    jshint_stylish = require('jshint-stylish'),
    sequence = require('run-sequence'),
    header = require('gulp-header'),
    pkg = require('./package.json'),
    banner = [
        '/*!',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' *',
        ' * Copyright 2014-2017 <%= pkg.author %>',
        ' * Released under the MIT license',
        ' * @license https://github.com/hoxxep/Snarl/blob/master/LICENSE ',
        ' */',
        '',
        ''
    ].join('\n');

gulp.task('less-src', function () {
    return gulp.src('src/less/snarl.less')
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist'))
        .pipe(less())
        .pipe(gulp.dest('./dist'))
        .pipe(less({compress: true}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./docs/static'));
});

gulp.task('less-homepage', function () {
    return gulp.src('docs/static/style.less')
        .pipe(less({compress: true}))
        .pipe(gulp.dest('./docs/static'));
});

gulp.task('less', ['less-src', 'less-homepage']);

gulp.task('jshint', function () {
    return gulp.src(['src/js/snarl.js', 'gulpfile.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(jshint_stylish))
        .pipe(jshint.reporter('fail'));
});

//TODO: sourcemaps
gulp.task('uglify', function () {
    return gulp.src('src/js/snarl.js')
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./docs/static'))
        .pipe(uglify({mangle: true, preserveComments: 'some'}))
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./docs/static'));
});

// Fail if jshint fails to stop gulp & uglify crashing
gulp.task('js', function () {
    sequence('jshint', 'uglify');
});

gulp.task('zip', function () {
    return gulp.src(['./dist/*', 'LICENSE', 'README.md'])
        .pipe(rename({dirname: 'snarl'}))
        .pipe(zip('snarl.zip'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['less', 'less-homepage', 'js', 'zip']);
gulp.task('default', ['build', 'watch']);

gulp.task('watch', ['build'], function () {
    gulp.watch(['src/js/*.js', 'src/less/*.less', 'docs/static/style.less'], ['build']);
});
