import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
/** @type {string[]} */
const args = process.argv

const dev = args.includes('--config-dev')

export default [
  {
    input: './assets/ts/app.ts',
    output: {
      dir: './assets/js',
      format: 'esm',
      sourcemap: dev
    },
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json'
      }),
      !dev ? terser() : null
    ]
  }
]
