import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/lottie/index.js',
  output: {
    file: 'lib/lottie-miniapp.js',
    format: 'cjs'
  },
  plugins: [babel(), nodeResolve({
    jsnext: true,
    main: true
  }), commonjs()]
};
