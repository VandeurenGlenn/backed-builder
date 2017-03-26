# backed-builder [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A command line interface for fast es6 development

## Installation

```sh
$ npm install backed-builder
```

## Usage
```js
soon...
```

## API

### Builder.build[{bundles}]

#### bundles
Type: `array`<br>
Default: `undefined`<br>
Options: `src, dest, format, babel`

An array of objects with each object containing a src & dest property

##### Minimal config
```json
{
  "bundles": [{
    "src": "some/path/to/index",
    "dest": "some/path/to/index"
  }]
}

```
##### Minimal config with multiple bundles
```json
{
  "bundles": [{
    "src": "some/path/to/index",
    "dest": "some/path/to/index"
  }, {
    "src": "some/other/path/to/element",
    "dest": "some/other/path/to/element"
  }]
}
```
##### Full config
```json
{
  "name": "some-element",
  "bundles": [{
    "src": "some/path/to/index",
    "dest": "some/path/to/index",
    "moduleName": "someElement",
    "format": "iife"
  }, {
    "src": "some/other/path/to/element",
    "dest": "some/other/path/to/element",
    "moduleName": "someElement",
    "format": ["iife", "es"],
    "babel": {"babel-config"}
  }]
}

```

[npm-image]: https://badge.fury.io/js/backed-builder.svg
[npm-url]: https://npmjs.org/package/backed-builder
[travis-image]: https://travis-ci.org/VandeurenGlenn/backed-builder.svg?branch=master
[travis-url]: https://travis-ci.org/VandeurenGlenn/backed-builder
[daviddm-image]: https://david-dm.org/VandeurenGlenn/backed-builder.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/VandeurenGlenn/backed-builder
[coveralls-image]: https://coveralls.io/repos/VandeurenGlenn/backed-builder/badge.svg
[coveralls-url]: https://coveralls.io/r/VandeurenGlenn/backed-builder
