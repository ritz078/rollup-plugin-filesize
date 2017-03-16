import fileSize from 'filesize';
import boxen from 'boxen';
import colors from 'colors';
import deepAssign from 'deep-assign';
import gzip from 'gzip-size';

function render (opt, size, gzip, bundle) {
	const primaryColor = opt.theme === 'dark' ? 'green' : 'black'
	const secondaryColor = opt.theme === 'dark' ? 'yellow' : 'blue'

	return boxen(
			colors[primaryColor].bold('Destination: ') + colors[secondaryColor](bundle.dest) + '\n' +
			colors[primaryColor].bold('Bundle size: ') + colors[secondaryColor](size) + ', ' +
			colors[primaryColor].bold('Gzipped size: ') + colors[secondaryColor](gzip), { padding: 1 }
		)
}

export default function filesize (options = {}) {

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
		getData (bundle, code) {
			let size = fileSize(Buffer.byteLength(code), opts.format);
			let gzipSize = fileSize(gzip.sync(code), opts.format);
			return opts.render(opts, size, gzipSize, bundle);
		},

		ongenerate(bundle, { code }){
			console.log(this.getData(bundle, code));
		}
	}
};
