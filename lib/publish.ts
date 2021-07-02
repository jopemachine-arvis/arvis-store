/* eslint-disable @typescript-eslint/no-var-requires */
import {
  fetchStore,
  fetchStaticStore,
  fetchPluginCompilationTemplate,
  fetchWorkflowCompilationTemplate
} from './arvisStoreApi';
import _ from 'lodash';
import alphaSort from 'alpha-sort';

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

  const store = await fetchStore();
  const staticStore = await fetchStaticStore();
  const bundleId = `${creator}.${name}`;

  let doc;
  let docPath;
  let extensions: any;
  const firstPublish: boolean = store[bundleId] ? false : true;

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
    webAddress,
    description
  };

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

  if (firstPublish) {
    // Add new extension to static-store
    staticStore[`${type}s`][bundleId] = {
      platform,
      description,
      creator,
      webAddress,
      uploaded: new Date().getTime()
    };

    // Create a PR adding new extension
    octokit
      .createPullRequest({
        base: 'master',
        owner: 'jopemachine',
        repo: 'arvis-store',
        title: `[bot] Add new ${type}, '${name}'`,
        head: `bot-add-${creator.split(' ').join('-')}-${name}`,
        body: `## Add new extension\n\n* Type: '${type}'\n* Creator: '${creator}'\n* Name: '${name}'\n* Description: ${description}`,
        changes: [
          {
            /* optional: if `files` is not passed, an empty commit is created instead */
            files: {
              [docPath]: doc,
              'internal/static-store.json': JSON.stringify(staticStore, null, 4),
            },
            commit: `[bot] Add new ${type}, '${name}'`,
          },
        ],
      });
  }
};