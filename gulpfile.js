const gulp = require("gulp");
const browserSync = require("browser-sync");
const nodemon = require("gulp-nodemon");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

function compileFrontend() {
  return (
    browserify({ entries: ["./src/web/js/main.js"] })
      .transform("babelify", { presets: ["@babel/preset-env"] })
      .bundle()
      // Pass desired output filename to vinyl-source-stream
      .pipe(source("bundle.js"))
      .pipe(buffer())
      // Start piping stream to tasks!
      .pipe(gulp.dest("./dist/js"))
  );
}

function nodemonStart() {
  let started = false;
  return nodemon({
    script: "./src/web/index.js"
  }).on("start", function() {
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
  gulp.watch(
    [
      "./src/web/js/main.js",
      "./src/web/views/index.pug",
      "./src/parserLib/**/*.js"
    ],
    gulp.series(compileFrontend)
  );
}

exports.nodemonStart = nodemonStart;
exports.default = gulp.parallel(nodemonStart, watch);
