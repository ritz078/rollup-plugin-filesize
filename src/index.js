import fileSize from 'filesize';
import boxen from 'boxen';
import Chalk from 'chalk';
import deepAssign from 'deep-assign';

var chalk = new Chalk.constructor({ enabled: true });

export default function filesize (options = {}) {

	function render (opt, size) {
		return opt.theme == 'dark' ? (
			boxen(chalk.green.bold('Bundle size : ') + chalk.yellow.bold(size), { padding: 1 })
		) : (
			boxen(chalk.black.bold('Bundle size : ') + chalk.blue.bold(size), { padding: 1 })
		);
	}

	let defaultOptions = {
		format: {},
		theme : 'dark',
		render: render
	};

	let opts = deepAssign({}, defaultOptions, options);
	if(options.render){
		opts.render = options.render;
	}

	return {
		transformBundle(code){
			let size = fileSize(Buffer.byteLength(code), opts.format);

			console.log(opts.render(opts, size));
			return opts.render(opts, size);
		}
	}
};
