const path = require('path');

module.exports = (env, argv) => {

    return {
        mode: 'development',
        devtool: 'inline-source-map',
        entry: './src/index.js',
        output: {
            filename: 'dev/FancyProductDesigner.js',
            path: path.resolve(__dirname, 'demos'),
            publicPath: '',
        },
        watchOptions: {
            ignored: ['/_uploads/', '/node_modules/', '/dist/**'],
        },
        devServer: {
            server: 'https',
            allowedHosts: 'all',
            client: {
                webSocketURL: 'auto://0.0.0.0:8080/ws',
            },
            static: [
                {
                    directory: path.join(__dirname, 'demos'),
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
            rules: [
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
            ]
        },
        plugins: [
            
        ]
    }

};