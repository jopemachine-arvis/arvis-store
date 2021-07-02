#!/usr/bin/env node
import { validate } from 'arvis-extension-validator';
import chalk from 'chalk';
import findUp from 'find-up';
import fse from 'fs-extra';
import meow from 'meow';
import ora from 'ora';
import path from 'path';
import { getGithubApiKey, setGithubApiKey } from '../lib/conf';
import { publish } from '../lib/publish';
import { searchExtension } from '../lib';
import getHelpStr from './getHelpStr';

const publishHandler = async (flags: any) => {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkgExist = await fse.pathExists(pkgPath);
  const extensionFilePath = await findUp(['arvis-workflow.json', 'arvis-plugin.json']);

  if (!extensionFilePath) {
    throw new Error('It seems current directory is not arvis extension directory.');
  }

  const pkg = pkgExist ? await fse.readJSON('package.json') : undefined;
  const extensionInfo = await fse.readJSON(extensionFilePath);

  if (pkgExist && (pkg.name !== extensionInfo.name)) {
    throw new Error('Make sure the package name is the same as the extension name.');
  }

  const type = extensionFilePath.endsWith('arvis-workflow.json') ? 'workflow' : 'plugin';
  const { valid, errorMsg } = validate(extensionInfo, type);

  if (!valid) {
    throw new Error(errorMsg);
  }

  const { creator, name, description, platform, webAddress } = extensionInfo;
  if (!webAddress) throw new Error('Please type valid \'webAddress\' of extension');
  if (!description) throw new Error('Please type valid \'description\' of extension');

  const bundleId = `${creator}.${name}`;

  const spinner = ora({
    color: 'cyan',
    discardStdin: true
  }).start(chalk.whiteBright(`Creating a PR to add '${bundleId}' to arvis-store..`));

  try {
    await publish({
      apiKey: getGithubApiKey(),
      creator,
      description,
      name,
      options: flags,
      platform,
      type,
      webAddress,
    });
  } catch (err) {
    spinner.fail('Works failed.');
    console.error(chalk.red(err));
    return;
  }

  spinner.succeed('🎉 Works done!');
};

const viewHandler = async (input: string) => {
  const spinner = ora({
    color: 'yellow',
    discardStdin: true
  }).start(chalk.whiteBright('Retrieving results..'));

  const retrievedExtensions = await searchExtension(input);
  const result = retrievedExtensions.map((extension) => {
    return chalk.whiteBright(`${chalk.magentaBright(extension.name)}
Type: ${chalk.yellow(extension.type)}
Total downloads: ${chalk.greenBright(extension.dt ? extension.dt : '?')}
Last week downloads: ${chalk.greenBright(extension.dw ? extension.dw: '?')}
Creator: ${chalk.green(extension.creator)}
Description: ${chalk.cyan(extension.description ? extension.description : '(No description)')}
`);}).join('\n');

  spinner.succeed('Jobs done.');
  console.log('\n' + result);
};

/**
 * @param  {string[]} input
 * @param  {any} flags?
 * @summary cli main function
 */
const cliFunc = async (input: string[], flags?: any) => {
  switch (input[0]) {
  case 's':
  case 'set':
  case 'set-gh-api-key':
    setGithubApiKey(input[1]);
    console.log(chalk.cyanBright('Github API key is set.'));
    break;

  case 'v':
  case 'view':
    await viewHandler(input[1]);
    break;

  case 'p':
  case 'pu':
  case 'pub':
  case 'publish':
    await publishHandler(flags);
  }

  return '';
};

const cli = meow(getHelpStr(), {
  flags: {
  }
});

(async () => {
  console.log(await cliFunc(cli.input, cli.flags));
})();
