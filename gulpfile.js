const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const nodemon = require("gulp-nodemon");

const tsProject = ts.createProject("tsconfig.json");

exports.compile = function(cb) {
	return tsProject
		.src()
		.pipe(tsProject())
		.js.pipe(gulp.dest("build"));
}; 

exports.copy = function(cb) {
	return gulp.src("./src/**/*.json").pipe(gulp.dest("build"));
};

exports.clean = function (cb) {
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
