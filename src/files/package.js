export default function genPackage(response) {
  const out = {
    name: response.package,
    version: '0.1.0',
    keywords: ['unplugin'],
    exports: {
      '.': {
        require: './dist/index.js',
        import: './dist/index.mjs',
      },
      './types': response.typescript
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
      entryPoints: ['src/*.' + response.typescript ? 'ts' : 'js'],
      clean: true,
      format: ['cjs', 'esm'],
      dts: response.typescript ? true : undefined,
    },
  };

  for (const bundler of response.bundlers) {
    out.keywords.push(bundler);

    out.exports[bundler] = {
      require: `./dist/${bundler}.js`,
      import: `./dist/${bundler}.mjs`,
    };
  }

  return out;
}
