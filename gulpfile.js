const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');

const tsProject = ts.createProject("tsconfig.json");

exports.compile = function() {
	return tsProject
		.src()
		.pipe(tsProject())
		.js.pipe(gulp.dest("build"));
}; 

exports.copy = function() {
	return gulp.src("./src/**/*.json").pipe(gulp.dest("build"));
};

exports.clean = function () {
	return gulp
		.src("build")
		.pipe(clean({ force: true }))
}

exports.build = async function () {
	gulp.series("compile", "copy")
};

exports.watch = function () {
	gulp.watch("src/**/*", gulp.series("clean", "copy", "compile"))
};
