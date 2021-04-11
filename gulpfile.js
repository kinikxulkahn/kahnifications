import postcss from 'gulp-postcss';
import nested from 'postcss-nested';
import atImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import cleanCSS from 'gulp-clean-css';
import gulp from 'gulp';
import tailwindcss from 'tailwindcss';
import sourcemaps from 'gulp-sourcemaps';

function css() {
    const plugins = [
        nested,
        atImport,
        autoprefixer
    ];
    return gulp.src('./css/*.css')
        .pipe(postcss([
            tailwindcss(),
            atImport,
            nested,
            autoprefixer
        ]))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./public/stylesheets'));
}

export default gulp.series(css);
