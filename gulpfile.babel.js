import gulp from 'gulp';
import gLP from 'gulp-load-plugins';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babel from 'babelify';
import runSeq from 'run-sequence';
import del from 'del';
// import { exec } from 'child_process';
import jsdocConf from './jsdoc.conf.json';
import pJSON from './package.json';

var plugins = gLP({
  rename: {
    'gulp-jsdoc-to-markdown': 'jsdocMD',
    'gulp-github-release': 'release',
    'gulp-gh-pages': 'pages'
  }
});

gulp.task('browser:build', () => {
  return browserify('./src/web.js', { debug: true })
    .ignore('moniker')
    .ignore('charlatan')
    .transform(babel, { presets: ['es2015'] })
    .bundle()
    // .pipe(source(`bundle-${pJSON.version}.js`))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
    .pipe(plugins.uglify())
    .on('error', plugins.util.log)
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('./build'));
    // return bundling('./src/web.js', (b) => b.transform(babel, { presets: ['es2015'] }));
});

gulp.task('browser:clean', () => {
  return del('build/**/*');
});

gulp.task('browser', (cb) => {
  return runSeq('browser:clean', 'browser:build', cb);
});

gulp.task('babel:build', () => {
  return gulp.src('src/**/*.js').pipe(plugins.babel()).pipe(gulp.dest('lib'));
});

gulp.task('babel:clean', () => {
  return del('lib/**/*');
});

gulp.task('babel', (cb) => {
  return runSeq('babel:clean', 'babel:build', cb);
});

gulp.task('build', (cb) => {
  return runSeq('babel', 'browser', cb);
});

gulp.task('test', () => {
  return gulp.src('test/**/*.js', {
    read: false
  }).pipe(plugins.mocha()).once('error', () => {
    process.exit(1);
  }).once('end', () => {
    process.exit();
  });
});

gulp.task('release', () => {
  var user = process.env.GITHUB_USER;
  var token = process.env.GITHUB_TOKEN;
  if (!user || !token) {
    if (!user) {
      console.log('You must set an environment variable named "GITHUB_USER" with your GitHub username.');
    }
    if (!token) {
      console.log('You must first set an environment variable named "GITHUB_TOKEN".')
      console.log('Please refer to the following for help.');
      console.log('\t(https://help.github.com/articles/creating-an-access-token-for-command-line-use/)');
    }
    process.exit(0);
  }
  
  return gulp.src('build/bundle.*').pipe(plugins.release({
    token,
    notes: `**Released by**: ${user}`,
    prerelease: (pJSON.version.split('.')[2] !== 0),
    manifest: pJSON
  }));
});

gulp.task('docs:build', (cb) => {
  gulp.src(['README.md', 'src/**/*.js'], { read: false }).pipe(plugins.jsdoc3(jsdocConf, cb));
});

gulp.task('docs:commit', () => {
  return gulp.src('./docs/*')
    .pipe(plugins.git.commit('Update docs'));
});

gulp.task('docs:push', () => {
  return gulp.src('docs/**/*').pipe(plugins.pages());
});

gulp.task('docs:clean', () => {
  return gulp.src(['.publish/**/*', 'docs/**/*']).pipe(plugins.clean());
});

gulp.task('docs', (cb) => {
  return runSeq('docs:build', 'docs:push', 'docs:clean', cb);
});
