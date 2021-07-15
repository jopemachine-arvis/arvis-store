import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { getGithubApiKey } from '../lib/conf';
import { createUnpublishRequest } from '../lib/unpublish';

export const unpublishHandler = async (creator: string, name: string) => {
  const spinner = ora({
    color: 'cyan',
    discardStdin: true
  }).start(chalk.whiteBright(`Creating a PR to delete '${name}' to arvis-store..`));

  try {
    const prResp = await createUnpublishRequest({
      creator,
      name,
      apiKey: getGithubApiKey(),
    });

    spinner.succeed('Works done.').stop();
    open(`https://github.com/jopemachine/arvis-store/pull/${prResp.data.number}`, { wait: false });

  } catch (err) {
    spinner.fail(err);
    process.exit(1);
  }
};