import { execSync } from 'child_process';
import { readdirSync } from 'fs';

export const capitalize = (/** @type {string} */ str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const dirEmpty = (/** @type {import("fs").PathLike} */ dir) =>
  readdirSync(dir).length > 0;

export function installDependencies(
  /** @type {string[]} */ dependencies,
  /** @type {string[]} */ devDependencies,
) {
  const packageManager =
    process.env.npm_config_user_agent?.split('/')?.[0] ?? 'npm';

  switch (packageManager) {
    case 'npm':
      execSync('npm i ' + dependencies.join(' '), {
        stdio: 'inherit',
      });
      execSync('npm i -D  ' + devDependencies.join(' '), {
        stdio: 'inherit',
      });
      break;
    case 'yarn':
      execSync('yarn add  ' + dependencies.join(' '), {
        stdio: 'inherit',
      });
      execSync('yarn add -D ' + devDependencies.join(' '), {
        stdio: 'inherit',
      });
      break;
    case 'pnpm':
      execSync('pnpm add  ' + dependencies.join(' '), {
        stdio: 'inherit',
      });
      execSync('pnpm add -D ' + devDependencies.join(' '), {
        stdio: 'inherit',
      });
      break;
  }
}

export const splitName = (/** @type {string} */ name) =>
  name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z\d]/g, ' ')
    .split(/ +/);
