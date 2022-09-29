const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        index: './src/index.js',
        raports: './src/pages/raports/raports.js'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [

        ],
    },
    plugins:[
        new HtmlWebpackPlugin({
            title: "Habit Tracker|Home",
            filename: "index.html",
            template: "./src/index.html",
            chunks: ['index'],
        }),
        new HtmlWebpackPlugin({
            title: "Habit Tracker|Raports",
            filename: "pages/raports.html",
            template: "./src/pages/raports/site.html",
            chunks: ['raports'],
        })
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname,'dist'),
        clean: true,
    }
}