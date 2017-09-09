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

#### showGzippedSize
type: `boolean`
default: true

Whether to show Gzipped size or not

#### format
type : `object`

default : {}

See the options [here](https://github.com/avoidwork/filesize.js)

#### render
type : `function`

return the command that you want to log. Eg:

```js
filesize({
	render : function (options, size){
		return size;
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

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/8CBegPnJTnjtddvd2E18Su4F/ritz078/rollup-plugin-filesize'>  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/8CBegPnJTnjtddvd2E18Su4F/ritz078/rollup-plugin-filesize.svg' /></a>
