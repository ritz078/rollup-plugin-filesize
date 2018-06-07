import babel from 'rollup-plugin-babel';
import filesize from "./src/index"

export default {
    external: [ 'filesize', 'boxen', 'chalk', 'deep-assign', 'colors', 'gzip-size' ],
    plugins: [
        babel({
					babelrc:false,
					presets: [ 'es2015-rollup' ]
        }),
        filesize()
    ],
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs'        
    }
};
