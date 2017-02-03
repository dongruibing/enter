var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
gulp.task('default',function(){
	gulp.watch('src/**.js',function(event){
		console.log(event.path + ' was ' + event.type + ', continue...');   
		gulp.src('src/gift.js')
		.pipe(rename({suffix:'.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));

	});
	
});


