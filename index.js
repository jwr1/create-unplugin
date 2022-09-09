#!/usr/bin/env node

import child_process from 'child_process';
import fs from 'fs';
import prompts from 'prompts';

if (fs.readdirSync('.').length > 0) {
  console.error('Directory not empty - setup failed.');
  process.exit(1);
}

const languages = ['JavaScript', 'TypeScript'];
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

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * @param {string} name
 * @returns {string[]}
 */
const splitName = (name) =>
  name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z\d]/g, ' ')
    .split(/ +/);

(async () => {
  const packageManager =
    process.env.npm_config_user_agent?.split('/')?.[0] ?? 'npm';

  const response = await prompts(
    [
      {
        type: 'text',
        name: 'name',
        message: 'Plugin Name',
        initial: 'hello world',
      },
      {
        type: 'text',
        name: 'package',
        message: 'Package Name',
        initial(prev, values) {
          return ['unplugin', ...splitName(values.name)].join('-');
        },
      },
      {
        type: 'text',
        name: 'export',
        message: 'Export Name',
        initial(prev, values) {
          return [...splitName(values.name), 'plugin'].map(capitalize).join('');
        },
      },
      {
        type: 'select',
        name: 'language',
        message: 'Language',
        choices: languages.map((v) => ({ title: v, value: v })),
        initial: 1,
      },
      {
        type: 'multiselect',
        name: 'bundlers',
        message: 'Bundlers',
        choices: Object.keys(bundlers).map((v) => ({
          title: bundlers[v].name,
          value: v,
          selected: true,
        })),
        hint: '- Space to select. Return to submit',
        instructions: false,
      },
    ],
    {
      onCancel: () => {
        console.error('Setup aborted.');
        process.exit(1);
      },
    },
  );

  const isTypescript = response.language == 'TypeScript';
  const fileExt = isTypescript ? '.ts' : '.js';

  fs.mkdirSync('src');

  fs.writeFileSync(
    `src/index${fileExt}`,
    `import { createUnplugin } from 'unplugin';
${isTypescript ? "import type { Options } from './types';\n" : ''}
export default createUnplugin${isTypescript ? '<Options>' : ''}(options => ({
  name: '${response.package}',
}))
`,
  );

  const dependencies = ['unplugin'];
  const devDependencies = ['tsup@6'];

  if (isTypescript) {
    devDependencies.push('typescript');

    fs.writeFileSync(
      'tsconfig.json',
      JSON.stringify(
        {
          compilerOptions: {
            target: 'es2017',
            module: 'esnext',
            lib: ['esnext', 'DOM'],
            moduleResolution: 'node',
            esModuleInterop: true,
            strict: true,
            strictNullChecks: true,
            resolveJsonModule: true,
          },
        },
        undefined,
        2,
      ),
    );
    fs.writeFileSync(
      'src/types.ts',
      `export interface Options {

}
`,
    );
  }

  const packageJson = {
    name: response.package,
    version: '0.1.0',
    keywords: ['unplugin'],
    exports: {
      '.': {
        require: './dist/index.js',
        import: './dist/index.mjs',
      },
      './types': isTypescript
        ? {
            require: './dist/types.js',
            import: './dist/types.mjs',
          }
        : undefined,
      './*': './*',
    },
    main: 'dist/index.js',
    module: 'dist/index.mjs',
    types: 'index.d.ts',
    typesVersions: {
      '*': {
        '*': ['./dist/*', './*'],
      },
    },
    files: ['dist'],
    scripts: {
      build: 'tsup',
      dev: 'tsup --watch src',
    },
    tsup: {
      entryPoints: ['src/*' + fileExt],
      clean: true,
      format: ['cjs', 'esm'],
      dts: isTypescript ? true : undefined,
    },
  };

  let readme = `# ${response.package}

## Install

\`\`\`sh
npm i ${response.package}
\`\`\`
`;

  for (const bundler of response.bundlers) {
    packageJson.keywords.push(bundler);

    packageJson.exports[bundler] = {
      require: `./dist/${bundler}.js`,
      import: `./dist/${bundler}.mjs`,
    };

    readme += `
<details>
<summary>${bundlers[bundler].name}</summary><br>

\`\`\`js
${bundlers[bundler].install(response.package, response.export)}
\`\`\`

<br></details>
`;

    fs.writeFileSync(
      `src/${bundler}${fileExt}`,
      `import unplugin from '.';

export const ${response.export} = unplugin.rollup;
`,
    );
  }

  fs.writeFileSync('package.json', JSON.stringify(packageJson, undefined, 2));
  fs.writeFileSync('README.md', readme);

  switch (packageManager) {
    case 'npm':
      child_process.execSync('npm i ' + dependencies.join(' '), {
        stdio: 'inherit',
      });
      child_process.execSync('npm i -D  ' + devDependencies.join(' '), {
        stdio: 'inherit',
      });
      break;
    case 'yarn':
      child_process.execSync('yarn add  ' + dependencies.join(' '), {
        stdio: 'inherit',
      });
      child_process.execSync('yarn add -D ' + devDependencies.join(' '), {
        stdio: 'inherit',
      });
      break;
    case 'pnpm':
      child_process.execSync('pnpm add  ' + dependencies.join(' '), {
        stdio: 'inherit',
      });
      child_process.execSync('pnpm add -D ' + devDependencies.join(' '), {
        stdio: 'inherit',
      });
      break;
  }
})();
