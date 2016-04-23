'use strict';

function _interopDefault (ex) { return 'default' in ex ? ex['default'] : ex; }

var fileSize = _interopDefault(require('filesize'));
var boxen = _interopDefault(require('boxen'));
var Chalk = _interopDefault(require('chalk'));
var deepAssign = _interopDefault(require('deep-assign'));

var chalk = new Chalk.constructor({ enabled: true });

function filesize() {
	var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	function render(opt, size) {
		return opt.theme == 'dark' ? boxen(chalk.green.bold('Bundle size : ') + chalk.yellow.bold(size), { padding: 1 }) : boxen(chalk.black.bold('Bundle size : ') + chalk.blue.bold(size), { padding: 1 });
	}

	var defaultOptions = {
		format: {},
		theme: 'dark',
		render: render
	};

	var opts = deepAssign({}, defaultOptions, options);
	if (options.render) {
		opts.render = options.render;
	}

	return {
		transformBundle: function transformBundle(code) {
			var size = fileSize(Buffer.byteLength(code), opts.format);

			console.log(opts.render(opts, size));
			return opts.render(opts, size);
		}
	};
};

module.exports = filesize;