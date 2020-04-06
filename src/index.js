import fileSize from "filesize";
import boxen from "boxen";
import colors from "colors";
import merge from "lodash.merge";
import gzip from "gzip-size";
import terser from "terser";

const brotli = require("brotli-size");

function render(opt, outputOptions, info) {
	const primaryColor = opt.theme === "dark" ? "green" : "black";
	const secondaryColor = opt.theme === "dark" ? "yellow" : "blue";

	const title = colors[primaryColor].bold;
	const value = colors[secondaryColor];

	const values = [
		...(outputOptions.file ?
			[`${title("Destination: ")}${value(outputOptions.file)}`] :
			(info.fileName ? [`${title("Bundle Name: ")} ${value(info.fileName)}`] : [])),
		...[`${title("Bundle Size: ")} ${value(info.bundleSize)}`],
		...(info.minSize ? [`${title("Minified Size: ")} ${value(info.minSize)}`] : []),
		...(info.gzipSize ? [`${title("Gzipped Size: ")} ${value(info.gzipSize)}`] : []),
		...(info.brotliSize ? [`${title("Brotli size: ")}${value(info.brotliSize)}`] : [])
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

	let opts = merge({}, defaultOptions, options);
	if (options.render) {
		opts.render = options.render;
	}

	const getData = function(outputOptions, bundle) {
	const { code, fileName } = bundle;
	const info = {};

	info.fileName = fileName;

		info.bundleSize = fileSize(Buffer.byteLength(code), opts.format);

		info.brotliSize = opts.showBrotliSize
			? fileSize(brotli.sync(code), opts.format)
			: "";

		if (opts.showMinifiedSize || opts.showGzippedSize) {
			const minifiedCode = terser.minify(code).code;
			info.minSize = opts.showMinifiedSize
				? fileSize(minifiedCode.length, opts.format)
				: "";
			info.gzipSize = opts.showGzippedSize
				? fileSize(gzip.sync(minifiedCode), opts.format)
				: "";
		}

		return opts.render(opts, outputOptions, info);
	};

	if (env === "test") {
		return getData;
	}

	return {
		name: "filesize",
		generateBundle(outputOptions, bundle, isWrite) {
			Object.keys(bundle)
				.map(fileName => bundle[fileName])
				.filter(currentBundle => {
					if (currentBundle.hasOwnProperty("type")) {
						return currentBundle.type !== "asset";
					}
					return !currentBundle.isAsset;
				})
				.forEach((currentBundle) => {
					console.log(getData(outputOptions, currentBundle))
				});
		}
	};
}
