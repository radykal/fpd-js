const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    
    let isProduction = process.env.NODE_ENV === 'production';
    //isProduction = true;
    
    return {
        mode: 'development',
        entry: './src/index.js',
        output: {
            filename: 'js/FancyProductDesigner.js',
            path: path.resolve(__dirname, 'dist'),
        },
        devServer: {
            static:  [
                {
                    directory: path.join(__dirname, 'dist'),
                    publicPath: '/dist',
                },
                { 
                    directory: path.join(__dirname, 'test'),
                    publicPath: '/test',
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