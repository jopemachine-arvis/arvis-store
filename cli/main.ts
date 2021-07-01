#!/usr/bin/env node
import chalk from 'chalk';
import fse from 'fs-extra';
import meow from 'meow';
import getHelpStr from './getHelpStr';

/**
 * @param  {string[]} input
 * @param  {any} flags?
 * @summary cli main function
 */
const cliFunc = async (input: string[], flags?: any) => {
  switch (input[0]) {
    case 'view':
      break;

    case 'pu':
    case 'pub':
    case 'publish':
      break;
  }

  return '';
};

const cli = meow(getHelpStr());

(async () => {
  console.log(await cliFunc(cli.input, cli.flags));
})();
