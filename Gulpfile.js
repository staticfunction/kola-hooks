/**
 * Created by jcabresos on 2/12/15.
 */
var gulp = require('gulp');
var ts = require('gulp-typescript');
var replace = require('gulp-replace');
var insert = require('gulp-insert');
var pkg = require('./package.json');
var del = require('del');
var merge = require('merge2');

gulp.task('clean-release', function(cb) {
    del(['dist'], cb);
})

gulp.task('release', ['clean-release'], function() {

    var src = ['src/hooks.ts', 'typings/tsd.d.ts'];

    var commonjs = gulp.src(src)
        .pipe(ts({
            declarationFiles: true,
            module: 'commonjs',
            noExternalResolve: false
        }));

    var amd = gulp.src(src)
        .pipe(ts({
            module: 'amd',
            noExternalResolve: false
        }));

    return merge([
        commonjs.dts
            .pipe(replace(/declare\s/g, ''))
            .pipe(insert.wrap('declare module \"'+ pkg.name +'\" {\n', '\n}'))
            .pipe(gulp.dest('dist')),
        commonjs.js
            .pipe(gulp.dest('dist')),
        amd.js
            .pipe(gulp.dest('dist/amd'))
    ])
})
