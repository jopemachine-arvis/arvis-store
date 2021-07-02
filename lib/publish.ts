/* eslint-disable @typescript-eslint/no-var-requires */
import chalk from 'chalk';
import execa from 'execa';
import {
  fetchStore,
  fetchStaticStore,
  fetchPluginCompilationTemplate,
  fetchWorkflowCompilationTemplate
} from './arvisStoreApi';
import { markdownTable } from 'markdown-table';
import _ from 'lodash';

let { Octokit } = require('@octokit/core');
const { createPullRequest } = require('octokit-plugin-create-pull-request');
Octokit = Octokit.plugin(createPullRequest);

const transformToMarkdownRow = (extensionInfo: any) => {
  const supportWin = extensionInfo.platform ? extensionInfo.platform.win32 : true;
  const supportMac = extensionInfo.platform ? extensionInfo.platform.darwin : true;
  const supportLinux = extensionInfo.platform ? extensionInfo.platform.linux : true;

  const isSupported = (support: boolean) => support ? 'O' : 'X';

  return [
    `[${extensionInfo.name}](${extensionInfo.webAddress})`,
    isSupported(supportWin),
    isSupported(supportMac),
    isSupported(supportLinux),
    extensionInfo.description ? extensionInfo.description : '(No description)'
  ];
};

export const publish = async ({
  apiKey,
  creator,
  description,
  name,
  options,
  platform,
  type,
  webAddress,
}: {
  apiKey: string;
  creator: string;
  description: string;
  name: string;
  options: any;
  platform: Record<string, unknown>;
  type: 'workflow' | 'plugin';
  webAddress: string;
}) => {
  const octokit = new Octokit({
    auth: apiKey,
  });

  if (!options.skipNpm) {
    const { stderr } = await execa('npm', ['--publish']);
    if (stderr) {
      throw new Error(chalk.redBright('npm publish failed!'));
    }
  } else {
    console.log(chalk.greenBright('skip npm publishing...'));
  }

  const store = await fetchStore();
  const staticStore = await fetchStaticStore();
  const bundleId = `${creator}.${name}`;

  let doc;
  let docPath;
  let extensions: any;
  if (type === 'workflow') {
    doc = await fetchWorkflowCompilationTemplate();
    docPath = 'docs/workflow-links.md';
    extensions = store.workflows;
  } else {
    doc = await fetchPluginCompilationTemplate();
    docPath = 'docs/plugin-links.md';
    extensions = store.plugins;
  }

  extensions[bundleId] = {
    platform,
    description
  };

  const extensionInfoArr = _.map(extensions, (extensionBundleId) => {
    const [creator, name] = extensionBundleId.split('.');
    return {
      name,
      ...extensions[extensionBundleId],
      description: staticStore[extensionBundleId],
      webAddress: staticStore[extensionBundleId],
      platform: staticStore[extensionBundleId],
    };
  });

  const tableStr = markdownTable([
    ['Name', 'Win', 'Mac', 'Linux', 'Description'],
    ...extensionInfoArr.map(transformToMarkdownRow)
  ], {
    align: ['l', 'c', 'c', 'c', 'l']
  }
  );

  doc = doc.replace('${links}', tableStr);

  if (!store[type][bundleId]) {
    staticStore[bundleId] = {
      platform,
      description,
      creator,
      webAddress,
      uploaded: new Date().getTime()
    };

    store[type][bundleId] = {};

    // Returns a normal Octokit PR response
    // See https://octokit.github.io/rest.js/#octokit-routes-pulls-create
    octokit
      .createPullRequest({
        owner: 'jopemachine',
        repo: 'arvis-store',
        title: `[bot] Add new ${type}, '${name}'`,
        body: `[bot] Add new ${type}, '${name}'`,
        base: 'master',
        changes: [
          {
            /* optional: if `files` is not passed, an empty commit is created instead */
            files: {
              [docPath]: doc,
              'internal/store.json': store,
              'internal/static-store.json': staticStore,
            },
            commit: `[bot] Add new ${type}, '${name}'`,
          },
        ],
      });
  }
};