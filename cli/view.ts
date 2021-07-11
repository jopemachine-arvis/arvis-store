import chalk from 'chalk';
import ora from 'ora';
import { searchExtension } from '../lib';

export const viewHandler = async (input: string) => {
  const spinner = ora({
    color: 'yellow',
    discardStdin: true
  }).start(chalk.whiteBright('Retrieving results..'));

  const retrievedExtensions = await searchExtension(input, { order: 'dt' });
  const result = retrievedExtensions.map((extension) => {
    return chalk.whiteBright(`${chalk.magentaBright(extension.name)}
Type: ${chalk.yellow(extension.type)}
Total downloads: ${chalk.greenBright(extension.dt ? extension.dt : '?')}
Last week downloads: ${chalk.greenBright(extension.dw ? extension.dw : '?')}
Creator: ${chalk.green(extension.creator)}
Description: ${chalk.cyan(extension.description ? extension.description : '(No description)')}
`);
  }).join('\n');

  spinner.succeed('Search done.').start();
  console.log('\n' + result);
};