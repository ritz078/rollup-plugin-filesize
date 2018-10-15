import fileSize from "filesize";
import boxen from "boxen";
import colors from "colors";
import deepAssign from "deep-assign";
import gzip from "gzip-size";
import brotli from "brotli-size";
import terser from "terser";

function render(opt, bundle, sizes) {
	const primaryColor = opt.theme === "dark" ? "green" : "black";
	const secondaryColor = opt.theme === "dark" ? "yellow" : "blue";

	const title = colors[primaryColor].bold;
	const value = colors[secondaryColor];

	const values = [
		...(bundle.file ? [`${title("Destination: ")}${value(bundle.file)}`] : []),
		...[`${title("Bundle Size: ")} ${value(sizes.bundleSize)}`],
		...(sizes.minSize ? [`${title("Minified Size: ")} ${value(sizes.minSize)}`] : []),
		...(sizes.gzipSize ? [`${title("Gzipped Size: ")} ${value(sizes.gzipSize)}`] : []),
		...(sizes.brotliSize ? [`${title("Brotli size: ")}${value(sizes.brotliSize)}`] : [])
	];

	return boxen(values.join("\n"), { padding: 1 });
}

export default function filesize(options = {}, env) {
	let defaultOptions = {
		format: {},
		theme: "dark",
		render: render,
		showGzippedSize: true,
		showBrotliSize: false,
		showMinifiedSize: true
	};

	let opts = deepAssign({}, defaultOptions, options);
	if (options.render) {
		opts.render = options.render;
	}

	const getData = function(bundle, code) {
		const sizes = {};
		sizes.bundleSize = fileSize(Buffer.byteLength(code), opts.format);

		sizes.brotliSize = opts.showBrotliSize
			? fileSize(brotli.sync(code), opts.format)
			: "";

		if (opts.showMinifiedSize || opts.showGzippedSize) {
			const minifiedCode = terser.minify(code).code;
			sizes.minSize = opts.showMinifiedSize
				? fileSize(minifiedCode.length, opts.format)
				: "";
			sizes.gzipSize = opts.showGzippedSize
				? fileSize(gzip.sync(minifiedCode), opts.format)
				: "";
		}

		return opts.render(opts, bundle, sizes);
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
