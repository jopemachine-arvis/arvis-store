import chalk from 'chalk';

export default () =>
  chalk.whiteBright(`
Usage

    To view some extension info, run below command.
        $ arvis-store view [some_extension_name]

    To publish arvis extension to store, need to set github api key first.
    Run below command to set github api key.
        $ arvis-store set-gh-api-key [github_api_key]

    To publish current extension directory to npm and arvis-store, run below command.
    If the extension in uploaded on npm, run
        $ arvis-store publish --npm
    Otherwise, run
        $ arvis-store publish --local

See README.md for more details.
`);
