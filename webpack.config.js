const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devtool: 'inline-source-map',
    module: {
        rules: [

        ],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname,'dist'),
    }
}