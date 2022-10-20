#!/usr/bin/env node

import fs from 'fs';

import prompt from './prompt.js';
import { dirEmpty, installDependencies } from './utils.js';

import genPackage from './files/package.js';
import genReadme from './files/README.js';
import genTsconfig from './files/tsconfig.js';
import genIndex from './files/src/index.js';
import genBundler from './files/src/bundler.js';
import genTypes from './files/src/types.js';

if (dirEmpty('.')) {
  console.error('Directory not empty - setup failed.');
  process.exit(1);
}

(async () => {
  const response = await prompt();

  fs.mkdirSync('src');

  const dependencies = ['unplugin'];
  const devDependencies = ['tsup@6'];

  if (response.typescript) {
    devDependencies.push('typescript');

    fs.writeFileSync(
      'tsconfig.json',
      JSON.stringify(genTsconfig(), undefined, 2),
    );
    fs.writeFileSync('src/types.ts', genTypes());
  }

  fs.writeFileSync(
    `src/index.${response.typescript ? 'ts' : 'js'}`,
    genIndex(response),
  );

  for (const bundler of response.bundlers) {
    fs.writeFileSync(
      `src/${bundler}.${response.typescript ? 'ts' : 'js'}`,
      genBundler(response, bundler),
    );
  }

  fs.writeFileSync('README.md', genReadme(response));
  fs.writeFileSync(
    'package.json',
    JSON.stringify(genPackage(response), undefined, 2),
  );

  installDependencies(dependencies, devDependencies);
})();
