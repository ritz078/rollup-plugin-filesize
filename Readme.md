# rollup-plugin-filesize

> A rollup plugin to show filesize in the cli

![](screen.png)

## Installation

```
npm install rollup-plugin-filesize
```

## Usage

```js
import { rollup } from 'rollup';
import filesize from 'rollup-plugin-filesize';

rollup({
  entry: 'main.js',
  plugins: [
    filesize()
  ]
}).then(...)
```

## options

#### showMinifiedSize
type: `boolean`
default: true

Whether to show minified size or not

#### showGzippedSize
type: `boolean`
default: true

Whether to show Gzipped size or not

#### showBrotliSize
type: `boolean`
default: false

Whether to show [Brotli](https://www.wikiwand.com/en/Brotli) size or not

#### showBeforeSizes
type: `boolean`
default: false

Whether to show a comparison between the `output.file` file size as it was
and as it is now being written. Useful to compare size of a new release to
the previous one (though note that if you run Rollup multiple times, this
info will be lost, except if still in your terminal history).

#### format
type : `object`

default : {}

See the options [here](https://github.com/avoidwork/filesize.js)

#### reporter
type : Array of `function`'s

After rendering occurs, you may wish to pass on the collected file data,
e.g., to build a badge for filesizes (as does [filesize-badger](https://github.com/brettz9/filesize-badger)).

You can use `reporter` to do so:

```js
filesize({
	reporter : [function (options, bundle, { minSize, gzipSize, brotliSize, bundleSize }){
		// If a promise is returned, it will be awaited before rendering.
		return promise;
	}]
})
```

#### theme
type: `string`

default : 'dark'

options : 'dark'/'light'

choose based on your terminal theme.



## License
MIT
