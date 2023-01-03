import { defineConfig } from 'tsup'

export const defineOpts = (newOpts = {}) => {
  return defineConfig((options) => ({
    entry: ['src/index.ts'],
    target: 'esnext',
    sourcemap: options.watch ? 'inline' : false,
    clean: true,
    minify: false,
    keepNames: false,
    tsconfig: './tsconfig.json',
    format: ['esm'],
    dts: true,
    ...newOpts,
  }))
}

export default defineOpts()
