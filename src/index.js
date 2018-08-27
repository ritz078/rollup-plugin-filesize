import fileSize from "filesize";
import boxen from "boxen";
import colors from "colors";
import deepAssign from "deep-assign";
import gzip from "gzip-size";
import brotli from "brotli-size";
import terser from "terser";

function render(opt, size, gzip, brotliSize, minifiedSize, bundle) {
	const primaryColor = opt.theme === "dark" ? "green" : "black";
	const secondaryColor = opt.theme === "dark" ? "yellow" : "blue";

	const title = colors[primaryColor].bold;
	const value = colors[secondaryColor];

	const values = [
		...(bundle.file ? [`${title("Destination: ")}${value(bundle.file)}`] : []),
		...[`${title("Bundle Size: ")} ${value(size)}`],
		...[`${title("Minified and Gzipped Size: ")} ${value(minifiedSize)}`],
		...(opt.showBrotliSize
			? [`${title("Brotli size: ")}${value(brotliSize)}`]
			: [])
	];

	return boxen(values.join("\n"), { padding: 1 });
}

export default function filesize(options = {}, env) {
	let defaultOptions = {
		format: {},
		theme: "dark",
		render: render,
		showGzippedSize: true,
		showBrotliSize: false
	};

	let opts = deepAssign({}, defaultOptions, options);
	if (options.render) {
		opts.render = options.render;
	}

	const getData = function(bundle, code) {
		let size = fileSize(Buffer.byteLength(code), opts.format);
		let gzipSize = opts.showGzippedSize
			? fileSize(gzip.sync(code), opts.format)
			: "";
		let brotliSize = opts.showBrotliSize
			? fileSize(brotli.sync(code), opts.format)
			: "";

		let minifiedSize = fileSize(gzip.sync(terser.minify(code).code));

		return opts.render(opts, size, gzipSize, brotliSize, minifiedSize, bundle);
	};

	if (env === "test") {
		return getData;
	}

	return {
		name: "filesize",
		ongenerate(bundle, { code }) {
			console.log(getData(bundle, code));
		}
	};
}
