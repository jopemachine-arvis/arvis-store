# arvis-store

Publish and Retrieve Arvis extension info

## Check on docs

* [Click me to check available Workflows](./docs/workflow-links.md)

* [Click me to check available Plugins](./docs/plugin-links.md)

## Usage

```js
const { searchExtension } = require('arvis-store');

(async () => {
   const result = await searchExtension('some_extension_name');
}) ();
```

## Usage - cli

```
Usage

    To view some extension info, run below command.
        $ arvis-store view [some_extension_name]

    To publish arvis extension to store, need to set github api key first.
    Run below command to set github api key.
        $ arvis-store set-gh-api-key [github_api_key]

    To publish current extension directory to npm and arvis-store, run below command.
        $ arvis-store publish

See README.md for more details.
```

## How it works

1. The store is `internal/store.json` file. and it is renewed once a day, and every time a new extension is added to the store by github-workflows

2. `internal/store.json` stores information that always requires renewal like npm download info, it's latest version.

3. `internal/statis-store.json`'s information updates only when extensions are created or need to be changed by the extension creator

4. `arvis-store publish` command creates a PR that adds your extension to the `internal/store.json` and `internal/static-store.json`.

## Related

- [arvish](https://github.com/jopemachine/arvish) - Arvis workflow, plugin creator tools