const gulp = require('gulp');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');
const del = require('del');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('compile', () => {
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest('build'));
});

gulp.task('copy', () => {
    return gulp.src('./src/**/*.json').pipe(gulp.dest('build'));
});

gulp.task('clean', () => {
    return del(['build/**/*']);
});

gulp.task('build', gulp.series('clean', 'compile', 'copy'));

gulp.task('start', (done) => {
    nodemon({
        verbose: true,
        script: 'build/vkdiary.js',
        watch: ['build/vkdiary.js'],
        exec: 'node --inspect',
        done: done,
        debug: true,
    });
});

gulp.task('serve', () => {
    gulp.watch('src/**/*', { ignoreInitial: false }, gulp.series('build'));
});
