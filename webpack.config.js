const path = require('path');

module.exports = {
    entry: './three/src/js/main.js',
    output: {
        filename: 'three.js',
        path: path.resolve(__dirname, './three/static/three')
    }
};
