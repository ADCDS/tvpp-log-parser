// @flow
const gulp = require("gulp");
const browserSync = require("browser-sync");
const nodemon = require("gulp-nodemon");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

function compileFrontend() {
	return (
		browserify({ entries: ["./src/web/js/main.js"], debug: true })
			.transform("babelify", { presets: ["@babel/preset-env"], sourceMaps: true })
			.bundle()
			// Pass desired output filename to vinyl-source-stream
			.pipe(source("bundle.js"))
			.pipe(buffer())
			// Start piping stream to tasks!
			.pipe(gulp.dest("./dist/js"))
	);
}

function compileWorkers() {
	return (
		browserify({entries: ["./src/web/worker/yenskst_worker.js"], debug: true, global: true})
			.transform("babelify", {presets: ["@babel/preset-env"], sourceMaps: true})
			.bundle()
			// Pass desired output filename to vinyl-source-stream
			.pipe(source("yenskst_worker.dist.js"))
			.pipe(buffer())
			// Start piping stream to tasks!
			.pipe(gulp.dest("./dist/js"))
	);
}

function nodemonStart() {
	let started = false;
	return nodemon({
		script: "./src/web/index.js",
		watch: "./src/web/index.js"
	}).on("start", () => {
		if (!started) {
			browserSync.init(null, {
				proxy: "http://localhost:3000",
				files: ["./dist/**/*.*"],
				browser: "chrome",
				port: 7000
			});
			started = true;
		}
	});
}

function watch() {
	gulp.watch(["./src/*.js", "./src/web/js/**/*.js", "./src/web/views/index.pug", "./src/parserLib/**/*.js"], gulp.series(compileFrontend));
}

function watch2() {
	gulp.watch(["./src/web/worker/*.js"], gulp.series(compileWorkers));
}

exports.default = gulp.series(compileFrontend, compileWorkers, gulp.parallel(nodemonStart, watch, watch2));
