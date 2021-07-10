# arvis-store

[![CodeFactor](https://www.codefactor.io/repository/github/jopemachine/arvis-store/badge)](https://www.codefactor.io/repository/github/jopemachine/arvis-store)
[![Known Vulnerabilities](https://snyk.io/test/github/jopemachine/arvis-store/badge.svg)]()
![CI](https://github.com/jopemachine/arvis-store/actions/workflows/test.yml/badge.svg)
[![NPM version](https://badge.fury.io/js/arvis-store.svg)](http://badge.fury.io/js/arvis-store)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
[![PR's Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![GitHub issues](https://img.shields.io/github/issues/jopemachine/arvis-store.svg)](https://GitHub.com/jopemachine/arvis-store/issues/)

Publish and Retrieve Arvis extension info

## Check on docs

* [Click me to check available Workflows](./docs/workflow-links.md)

* [Click me to check available Plugins](./docs/plugin-links.md)

## Usage - cli

### view

To view some extension info, run below command.

```
$ arvis-store view [some_extension_name]
```

### set github token

To publish arvis extension to store, need to set github api key first.
Run below command to set github api key.

```
$ arvis-store set-gh-api-key [github_api_key]
```

### publish

To publish current extension directory to npm and arvis-store, run below command.
If the extension in uploaded on npm, run

```
$ arvis-store publish --npm
```

Otherwise, run

```
$ arvis-store publish --local
```

### download

To download local extension file, (bundleId is 'creator.name')

```
$ arvis-store download workflow [some_extension_bundleId]
$ arvis-store download plugin [some_extension_bundleId]
```

### unpublish

To unpublish extension from store, run

```
$ arvis-store [creator_name] [extension_name]
```

## How to add arvis-extension to arvis-store

1. Install arvis-store

```
$ npm i -g arvis-store
```

2. Set Github personal access token

```
$ arvis-store set [github_personal_access_token]
```

3. Run publish command

If the extension in uploaded on npm,

Run

```
$ arvis-store publish --npm
```

Otherwise, Run

```
$ arvis-store publish --local
```

## How it works

1. The store is `internal/store.json` file. and it is renewed once a day, and every time a new extension is added to the store by github-workflows

2. `internal/store.json` stores information that always requires renewal like npm download info, it's latest version.

3. `internal/statis-store.json`'s information updates only when extensions are created or need to be changed by the extension creator

4. `arvis-store publish` command creates a PR that adds your extension to the `internal/static-store.json`.


## Related

- [arvish](https://github.com/jopemachine/arvish) - Arvis workflow, plugin creator tools
