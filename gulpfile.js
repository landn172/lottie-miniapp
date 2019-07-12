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

gulp.task('build:component', () => {
  return createTask(componetGlob)
    .pipe(gulp.dest('./example/component'));
});

gulp.task('build:lottie', () => {
  return createTask(lottieGlob)
    .pipe(gulp.dest('./example/lottie'));
});

gulp.task('publish', () => {
  return createTask(componetGlob, './lib/component')
    .pipe(replace('../lottie/index.js', '../index.js'))
    .pipe(gulp.dest('./lib/component'));
});

function watch() {
  gulp.watch(componetGlob, ['build:component']);
  return gulp.watch(lottieGlob, ['build:lottie']);
}

gulp.task('default', ['build:component', 'build:lottie'], () => {
  const args = process.argv.slice(2);
  if (args.includes('--watch')) {
    return watch();
  }
});

gulp.task('watch', () => {
  watch();
});
