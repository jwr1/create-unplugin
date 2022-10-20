import prompts from 'prompts';

import bundlers from './bundlers.js';
import { capitalize, splitName } from './utils.js';

export default function prompt() {
  return prompts(
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
        type: 'confirm',
        name: 'typescript',
        message: 'Use TypeScript',
        initial: true,
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
}
