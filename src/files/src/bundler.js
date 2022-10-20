export default function genBundler(response, bundler) {
  return `import unplugin from '.';

export const ${response.export} = unplugin.${bundler};
`;
}
