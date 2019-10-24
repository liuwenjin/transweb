const {
  src,
  dest,
  task
} = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
var cssUglify = require('gulp-minify-css');

task("Scene3D", function () {
  return src(["./static/components/Scene3D/three.min.js", 
              "./static/components/Scene3D/tween.js", 
              "./static/components/Scene3D/TrackballControls.js", 
              "./static/components/Scene3D/My3dRender.js"])
    .pipe(uglify())
    .pipe(concat('script.js'))
    .pipe(dest('./static/components/Scene3D/'));
});

task("Map3D", function () {
  return src(["./static/libs/three.min.js", 
              "./static/components/Map3D/tween.js", 
              "./static/components/Map3D/TrackballControls.js", 
              "./static/components/Map3D/My3dRender.js"])
    .pipe(uglify())
    .pipe(concat('script.js'))
    .pipe(dest('./static/components/Map3D/'));
});