import gulp from 'gulp';
import gLP from 'gulp-load-plugins';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import babel from 'babelify';
import runSeq from 'run-sequence';
import del from 'del';
import pJSON from './package.json';

var plugins = gLP();

// const compile = () => {
//     var bundler = watchify(browserify('./src/script.js', { debug: true }).transform(babel, { presets: ["es2015"] }));
//
//     var rebundle = () => {
//         bundler.bundle()
//             .on('error', function(err) {
//                 console.error(err);
//                 this.emit('end');
//             })
//             .pipe(source(`bundle-${pJSON.version}.js`))
//             .pipe(buffer())
//             .pipe(plugins.sourcemaps.init({ loadMaps: true }))
//             .pipe(plugins.sourcemaps.write('./'))
//             .pipe(gulp.dest('./'));
//     };
//     rebundle();
// };

// const bundling = (entry, cb = undefined) => {
//     if (cb === undefined || typeof cb !== "function") {
//         cb = (b) => b;
//     }
//     // var b = browserify('./src/index.js', { debug: true });
//     var b = browserify(entry, { debug: true });
//     // console.log(b);
//     b = cb(b);
//     // console.log(b);
//     return b.bundle()
//         // .pipe(source(`bundle-${pJSON.version}.js`))
//         .pipe(source(`bundle-${pJSON.version}.js`))
//         .pipe(buffer())
//         .pipe(plugins.sourcemaps.init({ loadMaps: true }))
//         .pipe(plugins.uglify())
//         .on('error', plugins.util.log)
//         .pipe(plugins.sourcemaps.write('./'))
//         .pipe(gulp.dest('./build'));
// };

// gulp.task('_browser', (cb) => {
//     return bundling('./dist/index.js');
// });
//
// gulp.task('browser', (cb) => {
//     // return browserify('./src/cmd.js', { debug: true })
//     //     // .transform(babel, { presets: ['es2015'] })
//     //     .bundle()
//     //     .pipe(source(`bundle-${pJSON.version}.js`))
//     //     .pipe(buffer())
//     //     .pipe(plugins.sourcemaps.init({ loadMaps: true }))
//     //     .pipe(uglify())
//     //     .on('error', plugins.util.log)
//     //     .pipe(plugins.sourcemaps.write('./'))
//     //     .pipe(gulp.dest('./build'));
//
//     // return bundling();
//
//     return runSeq('babel', '_browser', cb);
//
//     // return compile();
// });

// gulp.task('browser-babel', () => {
gulp.task('browser:build', () => {
    return browserify('./src/web.js', { debug: true })
        .ignore('moniker')
        .ignore('charlatan')
        .transform(babel, { presets: ['es2015'] })
        .bundle()
        .pipe(source(`bundle-${pJSON.version}.js`))
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
    gulp.src('src/**/*.js').pipe(plugins.babel()).pipe(gulp.dest('lib'));
});

gulp.task('babel:clean', () => {
    return del('lib/**/*');
});

gulp.task('babel', (cb) => {
    return runSeq('babel:clean', 'babel:build', cb);
});

gulp.task('build', (cb) => {
    return runSeq('babel', 'browser');
});
