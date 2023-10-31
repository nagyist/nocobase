import { Package } from '@lerna/package';
import chalk from 'chalk';
import execa from 'execa';
import path from 'path';
import { buildCjs } from './buildCjs';
import { buildClient } from './buildClient';
import { buildDeclaration } from './buildDeclaration';
import { buildPlugin } from './buildPlugin';
import {
  CORE_APP,
  CORE_CLIENT,
  PACKAGES_PATH,
  ROOT_PATH,
  getCjsPackages,
  getPluginPackages,
  getPresetsPackages,
} from './constant';
import { tarPlugin } from './tarPlugin';
import { PkgLog, UserConfig, getPackageJson, getPkgLog, getUserConfig, toUnixPath } from './utils';
import { getPackages } from './utils/getPackages';

export async function build(pkgs: string[]) {
  process.env.NODE_ENV = 'production';
  if (process.env.CI) {
    // @ts-ignore
    process.env.__E2E__ = true;
  }

  const packages = getPackages(pkgs);
  if (packages.length === 0) {
    console.error(chalk.red(`[@nocobase/build]: '${pkgs.join(', ')}' not match any packages.`));
    return;
  }

  const pluginPackages = getPluginPackages(packages);
  const cjsPackages = getCjsPackages(packages);
  const presetsPackages = getPresetsPackages(packages);

  // core/*
  await buildPackages(cjsPackages, 'lib', buildCjs);
  const clientCore = packages.find((item) => item.location === CORE_CLIENT);
  if (clientCore) {
    await buildPackage(clientCore, 'es', buildClient);
  }

  // plugins/*、samples/*
  await buildPackages(pluginPackages, 'dist', buildPlugin);

  // presets/*
  await buildPackages(presetsPackages, 'lib', buildCjs);

  // core/app
  const appClient = packages.find((item) => item.location === CORE_APP);
  if (appClient) {
    await runScript(['umi', 'build'], ROOT_PATH, {
      APP_ROOT: path.join(CORE_APP, 'client'),
    });
  }
}

export async function buildPackages(
  packages: Package[],
  targetDir: string,
  doBuildPackage: (cwd: string, userConfig: UserConfig, sourcemap: boolean, log?: PkgLog) => Promise<any>,
) {
  for await (const pkg of packages) {
    await buildPackage(pkg, targetDir, doBuildPackage);
  }
}

export async function buildPackage(
  pkg: Package,
  targetDir: string,
  doBuildPackage: (cwd: string, userConfig: UserConfig, sourcemap: boolean, log?: PkgLog) => Promise<any>,
) {
  const sourcemap = process.argv.includes('--sourcemap');
  const noDeclaration = process.argv.includes('--no-dts');
  const hasTar = process.argv.includes('--tar');
  const onlyTar = process.argv.includes('--only-tar');

  const log = getPkgLog(pkg.name);
  const packageJson = getPackageJson(pkg.location);

  if (onlyTar) {
    await tarPlugin(pkg.location, log);
    return;
  }

  log(`${chalk.bold(toUnixPath(pkg.location.replace(PACKAGES_PATH, '').slice(1)))} build start`);

  const userConfig = getUserConfig(pkg.location);
  // prebuild
  if (packageJson?.scripts?.prebuild) {
    log('prebuild');
    await runScript(['prebuild'], pkg.location);
    await packageJson.prebuild(pkg.location);
  }
  if (userConfig.beforeBuild) {
    log('beforeBuild');
    await userConfig.beforeBuild(log);
  }

  // build source
  await doBuildPackage(pkg.location, userConfig, sourcemap, log);

  // build declaration
  if (!noDeclaration) {
    log('build declaration');
    await buildDeclaration(pkg.location, targetDir);
  }

  // postbuild
  if (packageJson?.scripts?.postbuild) {
    log('postbuild');
    await runScript(['postbuild'], pkg.location);
  }

  if (userConfig.afterBuild) {
    log('afterBuild');
    await userConfig.afterBuild(log);
  }

  // tar
  if (hasTar) {
    await tarPlugin(pkg.location, log);
  }
}

function runScript(args: string[], cwd: string, envs: Record<string, string> = {}) {
  return execa('yarn', args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...envs,
      NODE_ENV: 'production',
    },
  });
}
