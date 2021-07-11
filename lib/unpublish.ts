/* eslint-disable @typescript-eslint/no-var-requires */
import {
  fetchStaticStore,
  fetchPluginCompilationTemplate,
  fetchWorkflowCompilationTemplate
} from './arvisStoreApi';
import _ from 'lodash';
import alphaSort from 'alpha-sort';
import open from 'open';

const markdownTable = require('markdown-table');
let { Octokit } = require('@octokit/core');
const { createPullRequest } = require('octokit-plugin-create-pull-request');
Octokit = Octokit.plugin(createPullRequest);

const transform = (extension: any) => {
  const supportWin = extension.platform ? extension.platform.includes('win32') : true;
  const supportMac = extension.platform ? extension.platform.includes('darwin') : true;
  const supportLinux = extension.platform ? extension.platform.includes('linux') : true;

  const isSupported = (support: boolean) => support ? 'O' : 'X';

  return [
    extension.webAddress ? `[${extension.name}](${extension.webAddress})` : extension.name,
    extension.creator,
    extension.description ? extension.description : '(No description)',
    isSupported(supportWin),
    isSupported(supportMac),
    isSupported(supportLinux),
  ];
};

export const unpublish = async ({
  apiKey,
  creator,
  name,
}: {
  apiKey: string;
  creator: string;
  name: string;
}) => {
  const octokit = new Octokit({
    auth: apiKey,
  });

  const staticStore = await fetchStaticStore();
  const bundleId = `${creator}.${name}`;

  let doc: string;
  let docPath: string;
  let extensions: any;

  if (!staticStore['workflows'][bundleId] && !staticStore['plugins'][bundleId]) {
    throw new Error('Extension not exist. Please check creator, name is correct.');
  }

  const type = staticStore['workflows'][bundleId] ? 'workflow' : 'plugin';

  if (type === 'workflow') {
    doc = await fetchWorkflowCompilationTemplate();
    docPath = 'docs/workflow-links.md';
    extensions = { ...staticStore.workflows };
  } else {
    doc = await fetchPluginCompilationTemplate();
    docPath = 'docs/plugin-links.md';
    extensions = { ...staticStore.plugins };
  }

  const extensionsSortedByName = Object.keys(extensions).sort((a: string, b: string) => {
    const aName = a.split('.')[1];
    const bName = b.split('.')[1];
    return alphaSort({ natural: true, caseInsensitive: true })(aName, bName);
  });

  const extensionInfoArr = _.map(extensionsSortedByName, (extensionBundleId) => {
    const [creator, name] = extensionBundleId.split('.');
    return {
      name,
      creator,
      ...extensions[extensionBundleId],
      ...staticStore[`${type}s`][extensionBundleId]
    };
  });

  const tableStr = markdownTable([
    ['Name', 'Creator', 'Description', 'Win', 'Mac', 'Linux'],
    ...extensionInfoArr.map(transform)
  ], {
    align: ['l', 'l', 'l', 'c', 'c', 'c']
  });

  doc = doc.replace('${links}', tableStr);

  // Add new extension to static-store
  delete staticStore[`${type}s`][bundleId];

  const title = `[bot] Delete ${type}, '${name}'`;
  const head = `bot-delete-${creator.split(' ').join('-')}-${name}`;
  const commitMessage = `[bot] Delete ${type}, '${name}'`;

  const body =
    `## Delete extension\n\n* Type: '${type}'\n* Creator: '${creator}'\n* Name: '${name}'\n* Reason: `;

  // Create a PR adding new extension
  const prResp = await octokit.createPullRequest({
    title,
    head,
    body,
    base: 'master',
    owner: 'jopemachine',
    repo: 'arvis-store',
    changes: [
      {
        files: {
          [docPath]: doc,
          'internal/static-store.json': JSON.stringify(staticStore, null, 4),
          [`icons/${type}/${bundleId}.png`]: null,
          [`extensions/${type}/${bundleId}.arvis${type}`]: null,
        },
        commit: commitMessage,
      },
    ],
  });

  open(`https://github.com/jopemachine/arvis-store/pull/${prResp.data.number}`, { wait: false });
};