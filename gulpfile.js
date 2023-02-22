const { src, dest, series } = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');

function buildVendorJS() {
    
    return src('./src/vendor/js/*.js')
        .pipe(uglify())
        .pipe(concat('vendor.js'))
        .pipe(dest('dist/js/'));
        
}

function buildJS() {
    
    return src('./src/classes/FancyProductDesigner.js')
        .pipe(babel())
        .pipe(dest('dist/js/'));
        
}

function minifyJS() {
    
    return src(['./dist/js/vendor.js', './dist/js/FancyProductDesigner.js'])
        .pipe(uglify())
        .pipe(concat('FancyProductDesigner.min.js'))
        .pipe(dest('dist/js/'));
        
}

function buildCSS() {
    
    return src('./src/ui/less/main.less')
        .pipe(less())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat('FancyProductDesigner.css'))
        .pipe(dest('./dist/css/'));
        
}

exports.buildJS = buildJS;
exports.minifyJS = minifyJS;
exports.buildCSS = buildCSS;
exports.buildVendors = series(buildVendorJS);
exports.default = series(buildVendorJS, buildJS, minifyJS, buildCSS);