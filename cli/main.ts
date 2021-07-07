#!/usr/bin/env node
import chalk from 'chalk';
import meow from 'meow';
import { setGithubApiKey } from '../lib/conf';
import { downloadExtension } from '../lib/download';
import getHelpStr from './getHelpStr';
import { publishHandler } from './publish';
import { unpublishHandler } from './unpublish';
import { viewHandler } from './view';

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
    break;

  case 'unpub':
  case 'unpublish':
    await unpublishHandler(input[1], input[2]);
    break;

  case 'download':
    if (input[1] !== 'workflow' && input[1] !== 'plugin') {
      throw new Error('extension type should be workflow or plguin');
    }
    await downloadExtension(input[1], input[2]);
    break;
  }

  return '';
};

const cli = meow(getHelpStr(), {
  flags: {
    npm: {
      type: 'boolean',
      alias: 'n',
      default: false,
      isRequired: () => false,
    },
    local: {
      type: 'boolean',
      alias: 'l',
      default: false,
      isRequired: () => false,
    }
  }
});

(async () => {
  console.log(await cliFunc(cli.input, cli.flags));
})();
