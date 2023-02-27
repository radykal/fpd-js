const path = require('path');

module.exports = (env, argv) => {
    
    let isProduction = process.env.NODE_ENV === 'production';
    //isProduction = true;
    
    return {
        mode: 'development',
        devtool: 'inline-source-map',
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
                    directory: path.join(__dirname, 'tests'),
                    publicPath: '/',
                },
                { 
                    directory: path.join(__dirname, 'data'),
                    publicPath: '/data',
                }
                
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