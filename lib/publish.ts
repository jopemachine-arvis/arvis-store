/* eslint-disable @typescript-eslint/no-var-requires */
import _ from 'lodash';
import alphaSort from 'alpha-sort';
import fse from 'fs-extra';
import shortHash from 'shorthash2';
import {
  fetchStaticStore,
  fetchPluginCompilationTemplate,
  fetchWorkflowCompilationTemplate
} from './arvisStoreApi';

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

export const createPublishRequest = async ({
  apiKey,
  creator,
  description,
  iconPath,
  installType,
  localInstallFile,
  name,
  options,
  platform,
  type,
  webAddress,
}: {
  apiKey: string;
  creator: string;
  description: string;
  iconPath?: string;
  installType: string;
  localInstallFile?: Buffer;
  name: string;
  options: any;
  platform: Record<string, unknown>;
  type: 'workflow' | 'plugin';
  webAddress: string;
}) => {
  const octokit = new Octokit({
    auth: apiKey,
  });

  const staticStore = await fetchStaticStore();
  const bundleId = `${creator}.${name}`;

  if (iconPath && !iconPath.endsWith('png')) {
    throw new Error('Only png icons can be uploaded.');
  }

  let doc: string;
  let docPath: string;
  let extensions: any;

  if (type === 'workflow') {
    doc = await fetchWorkflowCompilationTemplate();
    docPath = 'docs/workflow-links.md';
    extensions = { ...staticStore.workflows };
  } else {
    doc = await fetchPluginCompilationTemplate();
    docPath = 'docs/plugin-links.md';
    extensions = { ...staticStore.plugins };
  }

  extensions[bundleId] = {
    platform,
    webAddress,
    description,
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

  const firstPub = _.isUndefined(staticStore[`${type}s`][bundleId]);
  const uploaded = firstPub ? new Date().getTime() : staticStore[`${type}s`][bundleId].uploaded;

  // Add new extension to static-store
  staticStore[`${type}s`][bundleId] = {
    platform,
    description,
    creator,
    webAddress,
    uploaded,
    installType
  };

  const title = firstPub ? `[bot] Add new ${type}, '${name}'` : `[bot] Update ${type}, '${name}'`;
  const commitMessage = firstPub ? `[bot] Add new ${type}, '${name}'` : `[bot] Update new ${type}, '${name}'`;
  const body = firstPub ?
    `## Add new extension\n\n* Type: '${type}'\n* Creator: '${creator}'\n* Name: '${name}'\n* Description: ${description}` :
    `## Update extension info\n\n* Type: '${type}'\n* Creator: '${creator}'\n* Name: '${name}'\n* Description: ${description}`;

  const icon = iconPath ? await fse.readFile(iconPath) : undefined;
  const head = shortHash(`${creator}@${name}@${new Date().getTime()}`);

  // Create a PR adding new extension
  return await octokit.createPullRequest({
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
          [`icons/${type}/${bundleId}.png`]: icon ? {
            content: Buffer.from(icon).toString('base64'),
            encoding: 'base64',
          } : null,
          [`extensions/${type}/${bundleId}.arvis${type}`]: localInstallFile ? {
            content: Buffer.from(localInstallFile).toString('base64'),
            encodeURI: 'base64'
          } : null,
        },
        commit: commitMessage,
      },
    ],
  });
};