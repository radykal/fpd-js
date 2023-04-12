const { src, dest, series } = require('gulp');
const uglify = require('gulp-uglify');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const webpack = require('webpack-stream');


function buildVendorJS() {
    
    return src('./src/vendor/js/*.js')
        .pipe(uglify())
        .pipe(concat('vendor.js'))
        .pipe(dest('dist/js/'));
        
}

function buildJS() {
    
    return src('./src/classes/FancyProductDesigner.js')
        .pipe(webpack({
            mode: 'production',
            module: {
               rules:[
                    {
                        test: /\.less$/,
                        use:[
                            "style-loader", 
                            "css-loader",
                            "less-loader"
                        ]
                    },
                    {
                        test: /\.html$/i,
                        loader: "html-loader",
                    },
               ]
            }
        }))
        .pipe(concat('FancyProductDesigner.js'))
        .pipe(dest('dist/js/'));
        
}

function minifyJS() {
    
    return src(['./dist/js/vendor.js', './dist/js/FancyProductDesigner.js'])
        .pipe(uglify())
        .pipe(concat('FancyProductDesigner.min.js'))
        .pipe(dest('dist/js/'));
        
}

function buildVendorCSS() {
    
    return src(['./src/vendor/FontFPD/style.css'])
        .pipe(cleanCSS())
        .pipe(concat('vendor.css'))
        .pipe(dest('dist/css/'));
        
}

function buildCSS() {
    
    return src('./src/ui/less/main.less')
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(concat('FancyProductDesigner.css'))
        .pipe(dest('./dist/css/'));
        
}

exports.buildJS = buildJS;
exports.minifyJS = minifyJS;
exports.buildCSS = buildCSS;
exports.buildVendors = series(buildVendorJS, buildVendorCSS);
exports.default = series(buildVendorJS, buildJS, minifyJS, buildCSS);