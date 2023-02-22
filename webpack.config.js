const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    
    let isProduction = process.env.NODE_ENV === 'production';
    //isProduction = true;
    
    return {
        mode: 'development',
        devtool: isProduction ? 'source-map' : 'inline-source-map',
        entry: './src/index.js',
        output: {
            filename: 'js/FancyProductDesigner.js',
            path: path.resolve(__dirname, 'test'),
            publicPath: '',
        },
        devServer: {
            static:  [
                {
                    directory: path.join(__dirname, 'dist'),
                    publicPath: '/dist',
                },
                { 
                    directory: path.join(__dirname, 'test'),
                    publicPath: '/',
                }
            ]     
        },
        module: {
           rules:[
              {
                 test: /\.less$/,
                 use:[
                    isProduction ? MiniCssExtractPlugin.loader : "style-loader", 
                    "css-loader",
                    "less-loader"
                 ]
              }
           ]
        },
        plugins: isProduction ? [
            new MiniCssExtractPlugin({
                    filename: "css/[name].css",
            })
        ] 
            : 
        [
            
        ]
    }
    
};