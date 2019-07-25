# webpack-bundle-diff-add-children

A utility to add children to the bundle graph produced by webpack-bundle-diff
[npm](https://www.npmjs.com/package/webpack-bundle-diff) [github](https://github.com/smikula/webpack-bundle-diff)

## Usage

`yarn add webpack-bundle-diff-add-children`

```js
const getModuleGraphWithChildren = require("webpack-bundle-diff-add-children")
  .getModuleGraphWithChildren;
const deriveBundleData = require("webpack-bundle-diff").deriveBundleData;

// Get your bundle stats somehow
const webpackStats = require("fs").readFileSync("./stats.json", "utf-8");

// Derive webpack-bundle-diff data
const data = deriveBundleData(webpackStats);

// Add children to the graph
const graphWithChildren = getModuleGraphWithChildren(stats.bundleData.graph);
```

## Development

```sh
yarn # install dependencies
yarn build # build.             Can also use `rollup -c`
yarn watch # build with watch.  Can also use `rollup -cw`
```
