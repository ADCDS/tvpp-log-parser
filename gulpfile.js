const gulp = require("gulp");
const browserSync = require("browser-sync");
const nodemon = require("gulp-nodemon");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const browserify = require("browserify");
const source = require("vinyl-source-stream");

gulp.task("nodemon", function(cb) {
  let started = false;

  return nodemon({
    script: "./src/web/index.js"
  }).on("start", function() {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task(
  "browser-sync",
  gulp.series("nodemon", function() {
    browserSync.init(null, {
      proxy: "http://localhost:3000",
      files: ["./dist/**/*.*", "./src/web/**/*.*"],
      browser: "chrome",
      port: 7000
    });
  })
);

gulp.task("compile-parser-lib", () =>
  gulp
    .src("./src/parserLib/**/*.js")
    .pipe(
      babel({
        presets: ["@babel/preset-env"]
      })
    )
    .pipe(concat("tvpp-parser.min.js"))
    .pipe(gulp.dest("dist/js"))
);

gulp.task("compile-frontend-js", () => {
  return (
    browserify("./src/web/js/main.js")
      .bundle()
      // Pass desired output filename to vinyl-source-stream
      .pipe(source("bundle.js"))
      // Start piping stream to tasks!
      .pipe(gulp.dest("./dist/js"))
  );
});

gulp.task("watch", function() {
  gulp.watch(["./src/web/js/main.js"], gulp.series("compile-frontend-js"));
});

gulp.task(
  "default",
  gulp.parallel("watch", gulp.series("compile-parser-lib", "browser-sync"))
);
