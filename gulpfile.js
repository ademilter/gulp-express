const gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  prefix = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  prettify = require('gulp-html-prettify'),
  htmlmin = require('gulp-htmlmin'),
  pug = require('gulp-pug'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  sequence = require('gulp-sequence'),
  gulpif = require('gulp-if'),
  sourcemaps = require('gulp-sourcemaps'),
  nodemon = require('gulp-nodemon')

let config = {
  production: false,
  src: {
    'root': './source/',
    'static': './source/static/',
    'views': './source/views/',
    'styles': './source/styles/',
    'assets': './source/assets/'
  },
  dest: {
    'root': './www',
    'static': './www/static/',
    'views': './www/html/',
    'styles': './www/css/',
    'assets': './www/assets/'
  }
}

// STATIC ///////////////////////////////////

gulp.task('static', () => {
  return gulp.src(config.src.static + '**/*')
  .pipe(gulp.dest(config.dest.static))
})

gulp.task('assets', () => {
  return gulp.src(config.src.assets + '**/*')
  .pipe(gulp.dest(config.dest.assets))
})

// HTML ///////////////////////////////////

gulp.task('html', () => {
  gulp.src(config.src.views + '*.pug')
  .pipe(pug())
  .pipe(gulpif(config.production, htmlmin({
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    preserveLineBreaks: true,
    removeComments: true,
    removeRedundantAttributes: true,
    useShortDoctype: true
  })))
  .pipe(gulpif(config.production, prettify({
    indent_char: ' ',
    indent_size: 2
  })))
  .pipe(gulp.dest(config.dest.views))
  .on('end', browserSync.reload)
})

// CSS ///////////////////////////////////

gulp.task('css', () => {
  return gulp.src(config.src.styles + 'app.scss')
  .pipe(gulpif(!config.production, sourcemaps.init()))
  .pipe(sass())
  .pipe(prefix({
    'browsers': [
      'last 3 versions'
    ]
  }))
  .pipe(gulpif(config.production, cssnano({
    'discardComments': {
      'removeAll': true
    }
  })))
  .pipe(gulpif(!config.production, sourcemaps.write('/')))
  .pipe(gulp.dest(config.dest.styles))
  .pipe(browserSync.stream())
})

// BROWSERSYNC ///////////////////////////////////

gulp.task('browser-sync', ['nodemon'], function () {
  browserSync.init({
    proxy: 'http://localhost:1234',
    port: 2345
  })
  gulp.watch(config.src.views + '**/*.pug', ['html'])
  gulp.watch(config.src.styles + '**/*.scss', ['css'])
  gulp.watch(config.src.static + '**/*', ['static'])
  gulp.watch(config.src.assets + '**/*', ['assets'])
})

gulp.task('nodemon', function (cb) {
  let started = false
  return nodemon({
    script: './server.js',
    watch: ['./server.js']
  }).on('start', function onStart () {
    if (!started) {
      cb()
    }
    started = true
  })
})

// DO IT ///////////////////////////////////

gulp.task('default', ['browser-sync', 'html', 'css', 'static', 'assets'])

gulp.task('prod', function (cb) {
  config.production = true
  sequence('html', 'css', 'static', 'assets', cb)
})