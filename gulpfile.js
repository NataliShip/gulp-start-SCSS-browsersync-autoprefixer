var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require("gulp-notify"),
    del = require ('del'),
    babel = require('gulp-babel'),
	imagemin = require('gulp-imagemin'),
	pngquant = require ('imagemin-pngquant'),
	spritesmith = require('gulp.spritesmith');

// Сервер и автообновление страницы Browsersync
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false,
        // tunnel: true,
        // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
    });
});

// Минификация пользовательских скриптов проекта и JS библиотек в один файл
gulp.task('js', function () {
    return gulp.src([
            'app/libs/**/*.js',
            'app/js/scripts/*.js',
        ])
		.pipe(babel({
			presets: ['env']
		}))
        .pipe(concat('scripts.min.js'))
        .pipe(uglify()) // Минимизировать весь js (на выбор)
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sass', function () {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on("error", notify.onError()))
        .pipe(rename({
            suffix: '.min',
            prefix: ''
        }))
        .pipe(autoprefixer(['last 15 versions']))
        // .pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('clean', function(){
    return del.sync('dist');
});

gulp.task('sprite-clean', function () {
	return del.sync(['app/img/sprite/*', 'app/scss/sprite.scss']);
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function () {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch(['libs/**/*.js', 'app/js/scripts/*.js'], ['js']);
    gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('default', ['watch']);

gulp.task('sprite', ['sprite-clean'] , function() {
	var spriteData =
		gulp.src('app/img/icons/*.*') // путь, откуда берем картинки для спрайта
			.pipe(spritesmith({
				imgName: 'sprite.png',
				cssName: 'sprite.scss',
				cssFormat: 'scss',
				imgPath: '../img/sprite/sprite.png',
				padding: 2
			}));

	spriteData.img.pipe(gulp.dest('app/img/sprite/')); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest('app/scss/')); // путь, куда сохраняем стили
});

gulp.task('img', function () {
	return gulp.src(['app/img/*.*', 'app/img/sprite/*'])
		.pipe(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['clean', 'img', 'sass', 'js'], function () {

    var buildCss = gulp.src([
            'app/css/main.min.css',
        ])
        .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/*.js')
        .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});
