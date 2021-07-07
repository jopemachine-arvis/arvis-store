import chalk from 'chalk';
import ora from 'ora';
import { getGithubApiKey } from '../lib/conf';
import { unpublish } from '../lib/unpublish';

export const unpublishHandler = async (creator: string, name: string) => {
  const spinner = ora({
    color: 'cyan',
    discardStdin: true
  }).start(chalk.whiteBright(`Creating a PR to delete '${name}' to arvis-store..`));

  try {
    await unpublish({
      creator,
      name,
      apiKey: getGithubApiKey(),
    });
  } catch (err) {
    spinner.fail(err);
    process.exit(1);
  }

  spinner.succeed('Works done.');
};