const bundlers = {
  esbuild: {
    name: 'esbuild',
    install(packageName, exportName) {
      return `// esbuild.config.js
import { build } from 'esbuild'
import { ${exportName} } from '${packageName}/esbuild'

build({
  plugins: [
    ${exportName}(/* options */)
  ],
})`;
    },
  },
  rollup: {
    name: 'Rollup',
    install(packageName, exportName) {
      return `// rollup.config.js
import { ${exportName} } from '${packageName}/rollup'

export default {
  plugins: [
    ${exportName}(/* options */)
  ],
}`;
    },
  },
  rspack: {
    name: 'Rspack (experimental)',
    install(packageName, exportName) {
      return `// rspack.config.js
const { ${exportName} } = require('${packageName}/rspack');

module.exports = {
  plugins: [
    ${exportName}(/* options */)
  ],
}`;
    },
  },
  vite: {
    name: 'Vite',
    install(packageName, exportName) {
      return `// vite.config.ts
import { ${exportName} } from '${packageName}/vite'

export default defineConfig({
  plugins: [
    ${exportName}(/* options */)
  ],
})`;
    },
  },
  webpack: {
    name: 'Webpack',
    install(packageName, exportName) {
      return `// webpack.config.js
const { ${exportName} } = require('${packageName}/webpack');

module.exports = {
  plugins: [
    ${exportName}(/* options */),
  ],
};`;
    },
  },
};

export default bundlers;
