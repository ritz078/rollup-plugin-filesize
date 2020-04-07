import fileSize from "filesize";
import boxen from "boxen";
import colors from "colors";
import merge from "lodash.merge";
import gzip from "gzip-size";
import terser from "terser";

const { readFile: origReadFile } = require("fs");
const { promisify } = require("util");
const readFile = promisify(origReadFile);

const brotli = require("brotli-size");

async function render(opt, outputOptions, info) {
	const primaryColor = opt.theme === "dark" ? "green" : "black";
	const secondaryColor = opt.theme === "dark" ? "yellow" : "blue";

	const title = colors[primaryColor].bold;
	const value = colors[secondaryColor];

	const values = [
		...(outputOptions.file
			? [`${title("Destination: ")}${value(outputOptions.file)}`]
			: info.fileName
			? [`${title("Bundle Name: ")} ${value(info.fileName)}`]
			: []),
		...(info.bundleSizeBefore
			? [
					`${title("Bundle Size: ")} ${value(info.bundleSize)} (was ${value(
						info.bundleSizeBefore
					)})`
			  ]
			: [`${title("Bundle Size: ")} ${value(info.bundleSize)}`]),
		...(info.minSize
			? info.minSizeBefore
				? [
						`${title("Minified Size: ")} ${value(info.minSize)} (was ${value(
							info.minSizeBefore
						)})`
				  ]
				: [`${title("Minified Size: ")} ${value(info.minSize)}`]
			: []),
		...(info.gzipSize
			? info.gzipSizeBefore
				? [
						`${title("Gzipped Size: ")} ${value(info.gzipSize)} (was ${value(
							info.gzipSizeBefore
						)})`
				  ]
				: [`${title("Gzipped Size: ")} ${value(info.gzipSize)}`]
			: []),
		...(info.brotliSize
			? info.brotliSizeBefore
				? [
						`${title("Brotli size: ")}${value(info.brotliSize)} (was ${value(
							info.brotliSizeBefore
						)})`
				  ]
				: [`${title("Brotli size: ")}${value(info.brotliSize)}`]
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
		showBrotliSize: false,
		showMinifiedSize: true
	};

	let opts = merge({}, defaultOptions, options);
	if (options.render) {
		opts.render = options.render;
	}

	const getData = async function(outputOptions, bundle) {
		const { code, fileName } = bundle;
		const info = {};

		let codeBefore;
		try {
			codeBefore = await readFile(
				outputOptions.file || outputOptions.dest,
				"utf8"
			);
		} catch (err) {
			// File might not exist
		}

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

		if (codeBefore) {
			info.bundleSizeBefore = fileSize(
				Buffer.byteLength(codeBefore),
				opts.format
			);
			info.brotliSizeBefore = opts.showBrotliSize
				? fileSize(brotli.sync(codeBefore), opts.format)
				: "";
			if (opts.showMinifiedSize || opts.showGzippedSize) {
				const minifiedCode = terser.minify(codeBefore).code;
				info.minSizeBefore = opts.showMinifiedSize
					? fileSize(minifiedCode.length, opts.format)
					: "";
				info.gzipSizeBefore = opts.showGzippedSize
					? fileSize(gzip.sync(minifiedCode), opts.format)
					: "";
			}
		}

		return opts.render(opts, outputOptions, info);
	};

	if (env === "test") {
		return getData;
	}

	return {
		name: "filesize",
		async generateBundle(outputOptions, bundle /* , isWrite */) {
			const dataStrs = await Promise.all(
				Object.keys(bundle)
					.map(fileName => bundle[fileName])
					.filter(currentBundle => {
						if ({}.hasOwnProperty.call(currentBundle, "type")) {
							return currentBundle.type !== "asset";
						}
						return !currentBundle.isAsset;
					})
					.map(currentBundle => {
						return getData(outputOptions, currentBundle);
					})
			);
			dataStrs.forEach(str => {
				console.log(str);
			});
		}
	};
}
