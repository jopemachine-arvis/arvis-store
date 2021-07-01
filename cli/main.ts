#!/usr/bin/env node
import { validate } from 'arvis-extension-validator';
import chalk from 'chalk';
import findUp from 'find-up';
import fse from 'fs-extra';
import meow from 'meow';
import ora from 'ora';
import { getGithubApiKey, setGithubApiKey } from '../lib/conf';
import { publish } from '../lib/publish';
import getHelpStr from './getHelpStr';

const publishHandler = async () => {
  const extensionFilePath = await findUp(['arvis-workflow.json', 'arvis-plugin.json']);
  if (!extensionFilePath) {
    throw new Error('It seems current directory is not arvis extension directory.');
  }

  const extensionInfo =  await fse.readJSON(extensionFilePath);
  const type = extensionFilePath.endsWith('arvis-workflow.json') ? 'workflow' : 'plugin';
  const { valid, errorMsg } = validate(extensionInfo, type);

  if (!valid) {
    throw new Error(errorMsg);
  }

  const { creator, name } = extensionInfo;
  const bundleId = `${creator}.${name}`;

  const spinner = ora({
    color: 'cyan',
    discardStdin: true
  }).start(chalk.whiteBright(`Publishing '${bundleId}.arvis${type}'..`));

  await publish({ apiKey: getGithubApiKey(), creator, name, type });

  spinner.succeed('🎉 Works done!');
};

/**
 * @param  {string[]} input
 * @param  {any} flags?
 * @summary cli main function
 */
const cliFunc = async (input: string[], flags?: any) => {
  switch (input[0]) {
    case 'set-gh-api-key':
      setGithubApiKey(input[1]);
      break;

    case 'view':
      break;

    case 'pu':
    case 'pub':
    case 'publish':
      publishHandler();
  }

  return '';
};

const cli = meow(getHelpStr());

(async () => {
  console.log(await cliFunc(cli.input, cli.flags));
})();
