'use strict';

function _interopDefault (ex) { return 'default' in ex ? ex['default'] : ex; }

var fileSize = _interopDefault(require('filesize'));
var boxen = _interopDefault(require('boxen'));
var Chalk = _interopDefault(require('chalk'));
var _ = _interopDefault(require('lodash'));

var chalk = new Chalk.constructor({ enabled: true });

function filesize() {
	var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	return {
		transformBundle: function transformBundle(code) {

			var defaultOptions = {
				format: {},
				theme: 'dark',
				render: render
			};

			var opts = _.defaultsDeep(options, defaultOptions);

			function render(size) {
				return opts.theme == 'dark' ? boxen(chalk.green.bold('Bundle size : ') + chalk.yellow.bold(size), { padding: 1 }) : boxen(chalk.black.bold('Bundle size : ') + chalk.blue.bold(size), { padding: 1 });
			}

			var size = fileSize(Buffer.byteLength(code), opts.format);

			console.log(opts.render(size));
			return opts.render(size);
		}
	};
};

module.exports = filesize;