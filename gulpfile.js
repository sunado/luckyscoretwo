var gulp = require('gulp')
var spawn = require('child_process').spawn
var node

gulp.task('serve',[], gulp.series(function(){
    if(node) node.kill()
    node = spawn('node', ['index.js'],{stdio: 'inherit'})
    node.on('close',function(code){
        if (code === 8) {
            gulp.log("Some things wrong, ...")
        }
    })
}))


gulp.task('default', gulp.series(function(){
    gulp.run('serve')

    gulp.watch(['./index.js','./config.js'], () => gulp.run('serve'))

    gulp.watch('./**/*.js', () => gulp.run('serve'))

    gulp.watch('./view/*.hbs', () => gulp.run('serve'))

    gulp.watch('./view/*/*.hbs', () => gulp.run('serve'))

}))