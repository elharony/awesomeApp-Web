var gulp = require('gulp')
var sass = require('gulp-sass')
var browserSync = require('browser-sync').create()


// SASS
gulp.task('sass', function() {
    return gulp.src('./css/app.sass')
        .pipe(sass())
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.stream())
})

// Serve
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: './'
    })

    gulp.watch('./css/app.sass', ['sass'])
    gulp.watch('./*.html').on('change', browserSync.reload)
})


// Default
gulp.task('default', ['serve'])