import fileSize from 'filesize';
import boxen from 'boxen';
import Chalk from 'chalk';
import deepAssign from 'deep-assign';
import gzip from 'gzip-size';

var chalk = new Chalk.constructor({ enabled: true });

export default function filesize (options = {}) {

	function render (opt, size, gzip) {
		return opt.theme == 'dark' ? (
			boxen(chalk.green.bold('Bundle size : ') + chalk.yellow.bold(size) + ', ' +
				chalk.green.bold('Gzipped size : ') + chalk.yellow.bold(gzip), { padding: 1 })
		) : (
			boxen(chalk.black.bold('Bundle size : ') + chalk.blue.bold(size) + ', ' +
				chalk.black.bold('Gzipped size : ') + chalk.blue.bold(gzip), { padding: 1 })
		);
	}

	let defaultOptions = {
		format: {},
		theme: 'dark',
		render: render
	};

	let opts = deepAssign({}, defaultOptions, options);
	if (options.render) {
		opts.render = options.render;
	}

	return {
		ongenerate(bundle, { code }){
			let size = fileSize(Buffer.byteLength(code), opts.format);
			let gzipSize = fileSize(gzip.sync(code), opts.format);

			console.log(opts.render(opts, size, gzipSize));
			return {
				log: opts.render(opts, size, gzipSize),
				code: code,
				map: {
					mappings: ''
				}
			}
		}
	}
};
