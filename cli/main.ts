#!/usr/bin/env node
import { validate } from 'arvis-extension-validator';
import chalk from 'chalk';
import findUp from 'find-up';
import fse from 'fs-extra';
import meow from 'meow';
import ora from 'ora';
import { getGithubApiKey, setGithubApiKey } from '../lib/conf';
import { publish } from '../lib/publish';
import { searchExtension } from '../lib';
import getHelpStr from './getHelpStr';

const publishHandler = async (flags: any) => {
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

  const { creator, name, description, platform, webAddress } = extensionInfo;
  if (!webAddress) throw new Error('Please type valid \'webAddress\' of extension');
  if (!description) throw new Error('Please type valid \'description\' of extension');

  const bundleId = `${creator}.${name}`;

  const spinner = ora({
    color: 'cyan',
    discardStdin: true
  }).start(chalk.whiteBright(`Publishing '${bundleId}.arvis${type}'..`));

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
  } catch(err) {
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
    return `${chalk.magentaBright(extension.name)}
Type: ${extension.type}
Total downloads: ${extension.dt}
Last week downloads: ${extension.dw}
Creator: ${extension.creator}
Description: ${extension.description}
`;
  }).join('\n');

  spinner.succeed('Done.');
  console.log(result);
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
    console.log(chalk.cyanBright('Github API key is set.'));
    break;

  case 'view':
    await viewHandler(input[1]);
    break;

  case 'pu':
  case 'pub':
  case 'publish':
    await publishHandler(flags);
  }

  return '';
};

const cli = meow(getHelpStr(), { flags: { 
  skipNpm: {
    type: 'boolean',
    default: false,
    isRequired: false,
    alias: 's'
  }
}});

(async () => {
  console.log(await cliFunc(cli.input, cli.flags));
})();
