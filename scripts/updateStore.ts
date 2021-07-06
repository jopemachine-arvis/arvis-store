/* eslint-disable @typescript-eslint/no-var-requires */

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! This file should be run only in Github action. !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import chalk from 'chalk';
import getNpmDownloads, { NPMDownloadInfo } from 'get-npm-downloads';
import latestVersion from 'latest-version';
import { fetchStaticStore } from '../lib/arvisStoreApi';
let { Octokit } = require('@octokit/rest');
Octokit = Octokit.plugin(require('octokit-commit-multiple-files'));

// auth value should be given through github action
const octokit = new Octokit({ auth: process.argv[2] });

const updateInfo = async (bundleId: string) => {
  const extension: any = {};
  const [creator, name] = bundleId.split('.');

  try {
    const latest = await latestVersion(name);
    extension.latest = latest;
  } catch (err) {
    console.error(chalk.whiteBright.redBright(`'${name}'s latest version fetch fails\nError:${err}\n`));
  }

  try {
    const info = await getNpmDownloads({ repository: name, period: 'last-week' });
    extension.dw = (info as NPMDownloadInfo).downloads;
  } catch (err) {
    console.error(chalk.whiteBright.redBright(err));
  }

  try {
    const info = await getNpmDownloads({ repository: name, period: 'total' });
    extension.dt = (info as NPMDownloadInfo).downloads;
  } catch (err) {
    console.error(chalk.whiteBright.redBright(err));
  }

  return {
    [bundleId]: extension
  };
};

(async () => {
  const staticStore = await fetchStaticStore();
  const workflowBundleIds: string[] = Object.keys(staticStore.workflows);
  const pluginBundleIds: string[] = Object.keys(staticStore.plugins);

  const workflowNewInfos = (await Promise.allSettled(workflowBundleIds.map(updateInfo))).filter((item: any) => item.status === 'fulfilled').map((item: any) => (item as any).value);
  const renewedWorkflows = Object.assign({}, ...workflowNewInfos);

  const pluginNewInfos = (await Promise.allSettled(pluginBundleIds.map(updateInfo))).filter((item: any) => item.status === 'fulfilled').map((item: any) => (item as any).value);
  const renewedPlugins = Object.assign({}, ...pluginNewInfos);

  const store = {
    updated: new Date().getTime(),
    workflows: renewedWorkflows,
    plugins: renewedPlugins,
  };

  await octokit.repos.createOrUpdateFiles({
    owner: 'jopemachine',
    repo: 'arvis-store',
    branch: 'master',
    createBranch: false,
    changes: [
      {
        message: '[bot] Update store',
        files: {
          'internal/store.json': JSON.stringify(store),
        },
      }
    ],
  });
})();

