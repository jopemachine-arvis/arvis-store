import chalk from 'chalk';
import findUp from 'find-up';
import ora from 'ora';
import path from 'path';
import fse from 'fs-extra';
import open from 'open';
import { validate } from 'arvis-extension-validator';
import { createPublishRequest } from '../lib';
import { getGithubApiKey } from '../lib/conf';

const resolveInstallType = (flags: any) => {
  if (flags.npm) return 'npm';
  if (flags.local) return 'local';
  return undefined;
};

const inferInstallType = (pkgExist: boolean) => {
  return pkgExist ? 'npm' : 'local';
};

export const publishHandler = async (flags: any) => {
  const spinner = ora({
    color: 'cyan',
    discardStdin: true
  }).start(chalk.whiteBright('Checking extension info..'));

  const extensionFilePath = await findUp(['arvis-workflow.json', 'arvis-plugin.json'], { type: 'file', allowSymlinks: false });
  if (!extensionFilePath) {
    spinner.fail('It seems current directory is not arvis extension directory.').start();
    process.exit(1);
  }

  const extensionDir = path.dirname(extensionFilePath);
  const pkgPath = path.resolve(extensionDir, 'package.json');
  const pkgExist = await fse.pathExists(pkgPath);
  const pkg = pkgExist ? await fse.readJSON(pkgPath) : undefined;
  const extensionInfo = await fse.readJSON(extensionFilePath);

  let installType = resolveInstallType(flags);
  if (!installType) installType = inferInstallType(pkgExist);

  if (!pkgExist && installType === 'npm') {
    spinner.fail('npm flags on, but package.json not found!').start();
    process.exit(1);
  }

  if (pkgExist && (pkg.name !== extensionInfo.name)) {
    spinner.fail('Make sure the package name is the same as the extension name.').start();
    process.exit(1);
  }

  const type = extensionFilePath.endsWith('arvis-workflow.json') ? 'workflow' : 'plugin';
  const { valid, errorMsg } = validate(extensionInfo, type, { strict: true });

  if (!valid) {
    throw new Error(errorMsg);
  }

  const { creator, name, description, platform, webAddress, defaultIcon, version } = extensionInfo;

  if (pkgExist && (pkg.version !== extensionInfo.version)) {
    spinner.fail('Make sure the package version is the same as the extension version.').start();
    process.exit(1);
  }

  const iconPath: string = path.isAbsolute(defaultIcon) ? defaultIcon : path.resolve(extensionDir, defaultIcon);

  const bundleId = `${creator}.${name}`;

  let localInstallFile: Buffer | undefined;
  if (installType === 'local') {
    const installerFilePath = findUp.sync(`${bundleId}.arvis${type}`, { type: 'file', allowSymlinks: false });
    if (!installerFilePath) {
      spinner.fail(`local flags on, but '${bundleId}.arvis${type}' file not found!`).start();
      process.exit(1);
    }
    localInstallFile = await fse.readFile(installerFilePath);
  }

  spinner.start(chalk.whiteBright(`Creating a PR to add '${bundleId}' to arvis-store..`)).start();

  try {
    const prResp = await createPublishRequest({
      apiKey: getGithubApiKey(),
      creator,
      description,
      iconPath,
      installType,
      localInstallFile,
      name,
      options: flags,
      platform,
      type,
      webAddress,
    });

    spinner.succeed('🎉 Works done!').stop();
    open(`https://github.com/jopemachine/arvis-store/pull/${prResp.data.number}`, { wait: false });

  } catch (err) {
    spinner.fail('Works failed.').stop();
    console.error(chalk.red(err));
    return;
  }
};