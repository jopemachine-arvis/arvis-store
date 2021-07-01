import fse from 'fs-extra';
let { Octokit } = require('@octokit/core');
const { createPullRequest } = require('octokit-plugin-create-pull-request');
Octokit = Octokit.plugin(createPullRequest);

export const publish = async ({ name, creator, type, apiKey }: { name: string; creator: string; type: 'workflow' | 'plugin'; apiKey: string }) => {
    const octokit = new Octokit({
        auth: apiKey,
    });

    const store = await fse.readJSON('./internal/store.json');
    store[type][`${creator}.${name}`] = {};

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
                        'internal/store.json': 'Content for file1',
                    },
                    commit: `[bot] Add new ${type}, '${name}'`,
                },
            ],
        });

};