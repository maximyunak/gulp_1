const gulp = require("gulp");
const less = require("gulp-less");
const del = require("del");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const size = require("gulp-size");
const newer = require("gulp-newer");
const browsersync = require("browser-sync").create();
const gulppug = require("gulp-pug");
const stylus = require("gulp-stylus");
const sass = require("gulp-sass")(require("sass"));

const paths = {
  pug: {
    src: "src/*.pug",
    dest: "dist/",
  },
  html: {
    src: "src/*.html",
    dest: "dist/",
  },
  styles: {
    src: [
      "src/styles/**/*.sass",
      "src/styles/**/*.scss",
      "src/styles/**/*.less",
      "src/styles/**/*.styl",
    ],
    dest: "dist/css/",
  },
  scripts: {
    src: ["src/scripts/**/*.js", "src/scripts/**/*.coffee"],
    dest: "dist/js/",
  },
  images: {
    src: "src/img/**",
    dest: "dist/img/",
  },
};

function clean() {
  return del(["dist/*", "!dist/img"]);
}

function styles() {
  return (
    gulp
      .src(paths.styles.src)
      .pipe(sourcemaps.init())
      // .pipe(less())
      // .pipe(stylus())
      .pipe(sass().on("error", sass.logError))
      .pipe(
        autoprefixer({
          cascade: false,
        })
      )
      .pipe(
        cleanCSS({
          level: 2,
        })
      )
      .pipe(
        rename({
          basename: "main",
          suffix: ".min",
        })
      )
      .pipe(sourcemaps.write("."))
      .pipe(size())
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(browsersync.stream())
  );
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(size())

    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browsersync.stream());
}

function img() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin({
        progressive: true,
      })
    )
    .pipe(size())
    .pipe(gulp.dest(paths.images.dest));
}

function pug() {
  return gulp
    .src(paths.pug.src)
    .pipe(gulppug())
    .pipe(
      rename({
        basename: "main",
        suffix: ".min",
      })
    )
    .pipe(size())
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(browsersync.stream());
}

function htmlm() {
  return gulp
    .src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(
      rename({
        basename: "main",
        suffix: ".min",
      })
    )
    .pipe(size())
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browsersync.stream());
}

function watch() {
  browsersync.init({
    server: {
      baseDir: "./src",
    },
  });
  gulp.watch(paths.html.src).on("change", browsersync.reload);
  gulp.watch(paths.html.src, htmlm);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, img);
}

const build = gulp.series(
  clean,
  htmlm,
  gulp.parallel(styles, scripts, img),
  watch
);

exports.clean = clean;
exports.styles = styles;
exports.img = img;
exports.htmlm = htmlm;
exports.pug = pug;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.default = build;
