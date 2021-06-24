  const { src, dest, watch, parallel, series} = require('gulp');

  const scss                 = require('gulp-sass');
  const concat               = require('gulp-concat');
  const autoprefixer         = require('gulp-autoprefixer');
  const uglify               = require('gulp-uglify');
  const imagemin             = require('gulp-imagemin');
  const rename               = require('gulp-rename');
  const nunjucksRender       = require('gulp-nunjucks-render');
  const del                  = require('del');
  const browserSync          = require('browser-sync').create();


  function browsersync() {
    browserSync.init({
      server: {
        baseDir: 'docs/'
      },
      notify: false
    })
  }

  function nunjucks() {
    return src('docs/*.njk')
    .pipe(nunjucksRender())
    .pipe(dest('docs'))
    .pipe(browserSync.stream())
  }


  function styles(){
    return src('docs/scss/*.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    // .pipe(concat())
    .pipe(rename({
      suffix : '.min'
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('docs/css'))
    .pipe(browserSync.stream())
  }

  function scripts() {
    return src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/slick-carousel/slick/slick.js',
      'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
      'node_modules/rateyo/src/jquery.rateyo.js',
      'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
      'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
      'docs/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('docs/js'))
    .pipe(browserSync.stream())
  }


  function images() {
    return src('docs/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
  }


  function build() {
    return src([
      'docs/**/*.html',
      'docs/css/style.min.css',
      'docs/js/main.min.js',
    ], {base: 'docs'})
    .pipe(dest('dist'))
  }


  function cleanDist() {
    return del('dist')
  }


  function watching() {
    watch(['docs/**/*.scss'], styles);
    watch(['docs/*.njk'], nunjucks);
    watch(['docs/js/**/*.js', '!docs/js/main.min.js'], scripts);
    watch(['docs/**/*.html']).on('change', browserSync.reload);
  }


  exports.styles      = styles;
  exports.scripts     = scripts;
  exports.browsersync = browsersync;
  exports.watching    = watching;
  exports.cleanDist   = cleanDist;
  exports.images      = images;
  exports.nunjucks    = nunjucks;

  // Используем во время работы 'gulp default' или 'gulp'
  exports.default = parallel(nunjucks, styles, scripts, browsersync, watching);

  // Используем после работы 'gulp build'
  exports.build       = series(cleanDist, images, build);














