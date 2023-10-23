const { src, dest, series } = require('gulp');
const uglify = require('gulp-uglify');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const webpack = require('webpack-stream');
const copy = require('gulp-copy');

const { createModule } = require('./gulp-tasks/createModule');

function buildJS() {

    return src('./src/classes/FancyProductDesigner.js')
        .pipe(webpack({
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-env', { targets: "defaults" }]
                                ],
                                plugins: ["@babel/plugin-transform-private-methods"]
                            }
                        }
                    },
                    {
                        test: /\.less$/,
                        use: [
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

    return src(['./dist/js/FancyProductDesigner.js'])
        .pipe(uglify())
        .pipe(concat('FancyProductDesigner.min.js'))
        .pipe(dest('dist/js/'));

}

function buildVendorCSS() {

    return src(['./src/vendor/css/*.css', './src/vendor/FontFPD/style.css'])
        .pipe(cleanCSS())
        .pipe(concat('vendor.css'))
        .pipe(dest('dist/css/'));

}

function copyFontFiles() {

    return src('./src/vendor/FontFPD/fonts/*.*')
        .pipe(copy('dist/css/fonts/', { prefix: 4 }))
}

function buildCSS() {

    return src('./src/ui/less/main.less')
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(concat('FancyProductDesigner.css'))
        .pipe(dest('./dist/css/'));

}

function combineCSS() {

    return src(['./dist/css/vendor.css', './dist/css/FancyProductDesigner.css'])
        .pipe(concat('FancyProductDesigner.min.css'))
        .pipe(dest('dist/css/'));

}

exports.buildJS = buildJS;
exports.minifyJS = minifyJS;
exports.buildCSS = buildCSS;
exports.buildVendors = series(buildVendorCSS, copyFontFiles);
exports.default = series(buildVendorCSS, copyFontFiles, buildJS, minifyJS, buildCSS, combineCSS);
exports.createModule = createModule;