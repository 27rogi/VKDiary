const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const nodemon = require('gulp-nodemon');

const tsProject = ts.createProject("tsconfig.json");

gulp.task('compile', () => {
	return tsProject
		.src()
		.pipe(tsProject())
		.js.pipe(gulp.dest("build"));
}); 

gulp.task('copy', () => {
	return gulp.src("./src/**/*.json").pipe(gulp.dest("build"));
}); 
 
gulp.task('clean', () => {
	return gulp
		.src("build")
		.pipe(clean({ read: false }))
})

gulp.task('build', gulp.series("clean", "compile", "copy"));

gulp.task('start', (done) => {
		nodemon({
			script: 'build/vkdiary.js',
			ext: 'js',
			done: done
		})
});

gulp.task('serve', () => {
	gulp.watch('src/**/*', { ignoreInitial: false }, gulp.series('build'));
})
