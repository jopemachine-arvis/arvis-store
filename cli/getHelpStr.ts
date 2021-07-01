import chalk from 'chalk';

export default () =>
  chalk.whiteBright(`
Usage

  To view some extension info, run below command.
    arvis-store view [some_extension_name]

  To publish current extension directory to npm, add extension info to arvis-store,
    arvis-store publish

See README.md for more details.
`);
