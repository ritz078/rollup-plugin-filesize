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

#### format
type : `object`

default : {}

See the options [here](https://github.com/avoidwork/filesize.js)

#### render
type : `function`

return the command that you want to log. Eg:

```js
filesize({
	render : function (options, bundle, { minSize, gzipSize, brotliSize, bundleSize }){
		return minSize;
	}
})
```

#### theme
type: `string`

default : 'dark'

options : 'dark'/'light'

choose based on your terminal theme.



## License
MIT


