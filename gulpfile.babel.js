import gulp from 'gulp';
import gLP from 'gulp-load-plugins';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babel from 'babelify';
import runSeq from 'run-sequence';
import del from 'del';
import fs from 'fs';
import yargs from 'yargs';
import webpack from 'webpack-stream';
import webpackConf from './webpack.config';
// import { exec } from 'child_process';
import jsdocConf from './jsdoc.conf.json';
// import pJSON from './package.json';

function getPack() {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
}

var plugins = gLP({
  rename: {
    'gulp-jsdoc-to-markdown': 'jsdocMD',
    'gulp-github-release': 'release',
    'gulp-gh-pages': 'pages',
    'gulp-tag-version': 'tagVersion'
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

// gulp.task('babel:clean', () => {
//   return del('lib/**/*');
// });
// 
// gulp.task('babel', (cb) => {
//   return runSeq('babel:clean', 'babel:build', cb);
// });

gulp.task('build', (cb) => {
  return runSeq('browser', cb);
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

function inc(type) {
  return gulp.src('./package.json')
    .pipe(plugins.bump({ type }).on('error', plugins.util.log))
    .pipe(gulp.dest('./'));
}

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

gulp.task('github-release', () => {
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
    // prerelease: (pJSON.version.split('.')[2] !== 0),
    prerelease: (getPack().version.split('.')[2] !== 0),
    manifest: getPack()
  }));
});

gulp.task('bump-patch', () => inc('patch'));
gulp.task('bump-minor', () => inc('minor'));
gulp.task('bump-major', () => inc('major'));

gulp.task('commit-changes', () => {
  return gulp.src('.')
    .pipe(plugins.git.add())
    .pipe(plugins.git.commit('Bumped version number.'));
});

gulp.task('push-changes', (cb) => {
  plugins.git.push('origin', 'master', cb);
});

gulp.task('create-new-tag', (cb) => {
  let { version } = getPack();
  plugins.git.tag('v'+version, `Created Tag for version: v${version}`, (err) => {
    if (err) {
      return cb(err);
    }
    plugins.git.push('origin', 'master', { args: '--tags' }, cb);
  });
});

gulp.task('release', (cb) => {
  var argv = yargs.options({
    bump: {
      alias: 'b',
      demand: false,
      default: 'patch',
      choices: ['patch', 'minor', 'major'],
      type: 'string'
    }
  }).argv;
  
  // runSeq('build', `bump-${argv.bump}`, 'commit-changes', 'push-changes', 'create-new-tag', 'github-release', (err) => {
  runSeq('build', `bump-${argv.bump}`, 'build', 'commit-changes', 'push-changes', 'create-new-tag', 'github-release', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('RELEASE FINISHED SUCCESSFULLY');
    }
    cb(err);
  });
});

gulp.task('webpack', () => {
  return gulp.src('src/web.js')
    .pipe(webpack(webpackConf))
    .pipe(gulp.dest('build'));
});
