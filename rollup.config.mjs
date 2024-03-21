import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
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
      typescript({
        tsconfig: './tsconfig.json'
      }),
      !dev ? terser() : null
    ]
  }
]
