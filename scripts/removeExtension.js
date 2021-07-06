/* eslint-disable @typescript-eslint/no-var-requires */

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! This file remove extension from only local file !!!
// !!! To remove extension from store, use unpublish.  !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const chalk = require('chalk');
const fse = require('fs-extra');
const store = require('../internal/store');
const staticStore = require('../internal/static-store');

const target = process.argv[2];

delete store.workflows[target];
delete store.plugins[target];

delete staticStore.workflows[target];
delete staticStore.plugins[target];

console.log(chalk.redBright('Removed ' + target));

fse.writeJsonSync('internal/store.json', store);
fse.writeJsonSync('internal/static-store.json', staticStore, { encoding: 'utf-8', spaces: 4 });
