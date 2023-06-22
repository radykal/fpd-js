const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');   

module.exports = (env, argv) => {
    
    let isProduction = process.env.NODE_ENV === 'production';
    //isProduction = true;
    
    return {
        mode: 'development',
        devtool: 'inline-source-map',
        entry: './src/index.js',
        output: {
            filename: 'dev/FancyProductDesigner.js',
            path: path.resolve(__dirname, 'examples'),
            publicPath: '',
        },
        watchOptions: {
            ignored: ['/_uploads/', '/node_modules/', '/dist/**'],
        },
        devServer: {
            server: 'https',  
            static:  [
                { 
                    directory: path.join(__dirname, 'examples'),
                    publicPath: '/',
                },
                {
                    directory: path.join(__dirname, 'dist'),
                    publicPath: '/dist',
                },
                { 
                    directory: path.join(__dirname, 'data'),
                    publicPath: '/data',
                },           
            ]     
        },
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
        },
        plugins: []
    }
    
};