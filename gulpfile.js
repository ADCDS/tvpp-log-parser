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

function compileGraphsGenFrontend() {
	return (
		browserify({ entries: ["./src/charts_gen/main.js"], debug: true })
			.transform("babelify", { presets: ["@babel/preset-env"], sourceMaps: true })
			.bundle()
			// Pass desired output filename to vinyl-source-stream
			.pipe(source("charts_gen.bundle.js"))
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

function watchMain() {
	gulp.watch(["./src/*.js", "./src/web/js/**/*.js", "./src/web/views/index.pug", "./src/parserLib/**/*.js"], gulp.series(compileFrontend));
}

function watchWorker() {
	gulp.watch(["./src/web/worker/*.js"], gulp.series(compileWorkers));
}

function watchChartsGen() {
	gulp.watch(["./src/*.js", "./src/web/js/**/*.js", "./src/web/views/graphs_gen.pug", "./src/parserLib/**/*.js", "./src/charts_gen/**/*.js"], gulp.series(compileGraphsGenFrontend));
}

exports.default = gulp.series(compileFrontend, compileWorkers, compileGraphsGenFrontend, gulp.parallel(nodemonStart, watchMain, watchWorker, watchChartsGen));
