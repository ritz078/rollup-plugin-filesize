import fileSize from 'filesize';
import boxen from 'boxen';
import Chalk from 'chalk';
import _ from 'lodash';

var chalk = new Chalk.constructor({ enabled: true });

export default function filesize (options = {}) {
	return {
		transformBundle(code){

			let defaultOptions = {
				format: {},
				theme : 'dark',
				render: render
			};

			let opts = _.defaultsDeep(options, defaultOptions);

			function render (size) {
				return opts.theme == 'dark' ? (
					boxen(chalk.green.bold('Bundle size : ') + chalk.yellow.bold(size), { padding: 1 })
				) : (
					boxen(chalk.black.bold('Bundle size : ') + chalk.blue.bold(size), { padding: 1 })
				);
			}

			let size = fileSize(Buffer.byteLength(code), opts.format);

			console.log(opts.render(size));
			return opts.render(size);
		}
	}
};
