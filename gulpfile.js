const gulp = require('gulp');
const cached = require('gulp-cached');
const babel = require('gulp-babel');
const gulpif = require('gulp-if');
const replace = require('gulp-replace');
const fs = require('fs');

const babelConfig = JSON.parse(fs.readFileSync('./.babelrc', {
  encoding: 'utf-8'
}));

babelConfig.presets = [
  ['env', {
    modules: 'commonjs'
  }]
];

const componetGlob = './src/component/**';
const lottieGlob = './src/lottie/**';

function createTask(glob) {
  return gulp.src(glob)
    .pipe(cached(glob))
    .pipe(gulpif('*.js', babel(babelConfig)));
}

function buildLottie() {
  return createTask(lottieGlob)
    .pipe(gulp.dest('./example/lottie'));
}

function publish() {
  return createTask(componetGlob, './lib/component')
    .pipe(replace('../lottie/index.js', '../index.js'))
    .pipe(gulp.dest('./lib/component'));
}

function watch() {
  gulp.watch(componetGlob, buildComponent);
  return gulp.watch(lottieGlob, buildLottie);
}

function buildComponent() {
  return createTask(componetGlob)
    .pipe(gulp.dest('./example/component'));
}

const build = gulp.series(buildComponent, buildLottie);
const buldWithWatch = gulp.parallel(build, watch);
function defaultFunc() {
  const args = process.argv.slice(2);
  if (args.includes('--watch')) {
    return buldWithWatch;
  }
  return build;
}

exports.default = defaultFunc();
exports.publish = publish;
