/* eslint-disable @typescript-eslint/no-var-requires */
import chalk from 'chalk';
import execa from 'execa';
import { fetchStore } from './fetchStore';
import {
  fetchPluginCompilationTemplate,
  fetchWorkflowCompilationTemplate
} from './fetchDocs';
import { markdownTable } from 'markdown-table';

let { Octokit } = require('@octokit/core');
const { createPullRequest } = require('octokit-plugin-create-pull-request');
Octokit = Octokit.plugin(createPullRequest);

const transform = (extensionInfo: any) => {
  const supportWin = extensionInfo.platform ? extensionInfo.platform.win32 : true;
  const supportMac = extensionInfo.platform ? extensionInfo.platform.darwin : true;
  const supportLinux = extensionInfo.platform ? extensionInfo.platform.linux : true;

  const isSupported = (support: boolean) => support ? 'O' : 'X';

  return [
    extensionInfo.name,
    isSupported(supportWin),
    isSupported(supportMac),
    isSupported(supportLinux),
    extensionInfo.description
  ];
};

export const publish = async ({
  name,
  creator,
  platform,
  description,
  type,
  apiKey,
  options
}: {
  name: string;
  creator: string;
  type: 'workflow' | 'plugin';
  apiKey: string;
  options: any;
  platform: Record<string, unknown>;
  description: string;
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
  const bundleId = `${creator}.${name}`;

  let doc;
  let docPath;
  let extensions;
  if (type === 'workflow') {
    doc = await fetchWorkflowCompilationTemplate();
    docPath = 'docs/workflow-links.md';
    extensions = store.workflows;
  } else {
    doc = await fetchPluginCompilationTemplate();
    docPath = 'docs/plugin-links.md';
    extensions = store.plugins;
  }

  const tableStr = markdownTable([
    ['Name', 'Win', 'Mac', 'Linux', 'Description'],
    ...extensions.map(transform)
  ]
  , {
    align: ['l', 'c', 'c', 'c', 'l']
  }
  );

  doc = doc.replace('${links}', tableStr);

  if (!store[type][bundleId]) {
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
              'internal/store.json': store,
              [docPath]: doc,
            },
            commit: `[bot] Add new ${type}, '${name}'`,
          },
        ],
      });
  }
};