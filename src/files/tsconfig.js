export default function genTsconfig() {
  return {
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
  };
}