import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import {version} from './package.json';

export default {
    input: 'src/tooltips.ts',
    output: [
        {
            file: 'dist/tooltips.js',
            format: 'umd',
            name: 'Tooltips',
            exports: 'named',
            banner: `/** @license: MIT \n Webenomic Tooltips v${version} | Copyright (c) ${new Date().getFullYear()} | Ben Silverman, Webenomic LLC \n**/`
        },
    ],
    plugins: [typescript(),commonjs(),cleanup({ comments: 'none', extensions: ['js', 'ts'] })],
};