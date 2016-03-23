import gulp from 'gulp';
import gLP from 'gulp-load-plugins';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import watchify from 'watchify';
import babel from 'babelify';

var plugins = gLP();

const compile = () => {
    var bundler = watchify(browserify('./src/script.js', { debug: true }).transform(babel, { presets: ["es2015"] }));

    var rebundle = () => {
        bundler.bundle()
            .on('error', function(err) {
                console.error(err);
                this.emit('end');
            })
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(plugins.sourcemaps.init({ loadMaps: true }))
            .pipe(plugins.sourcemaps.write('./'))
            .pipe(gulp.dest('dist'));
    };
    rebundle();
};

gulp.task('browserify', () => {
    return compile();
});

gulp.task('babel', () => {
    gulp.src('src/**/*.js').pipe(plugins.babel()).pipe(gulp.dest('dist'));
});
