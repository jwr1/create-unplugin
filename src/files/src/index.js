export default function genIndex(response) {
  return `import { createUnplugin } from 'unplugin';
${response.typescript ? "import type { Options } from './types';\n" : ''}
export default createUnplugin${
    response.typescript ? '<Options>' : ''
  }(options => ({
  name: '${response.package}',
}))
`;
}
