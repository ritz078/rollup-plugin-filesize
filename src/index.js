import { readFile as origReadFile } from "fs";
import { promisify } from "util";
import { dirname, resolve as pathResolve } from "path";

import fileSize from "filesize";
import gzip from "gzip-size";
import terser from "terser";
import brotli from "brotli-size";

const readFile = promisify(origReadFile);

export default function filesize(options = {}, env) {
	let {
		render,
		format = {},
		theme = "dark",
		showBeforeSizes = false,
		showGzippedSize = true,
		showBrotliSize = false,
		showMinifiedSize = true,
	} = options;

	const getLoggingData = async function (outputOptions, bundle) {
		const { code, fileName } = bundle;
		const info = {};

		let codeBefore;
		if (showBeforeSizes) {
			try {
				codeBefore = await readFile(
					outputOptions.file || outputOptions.dest,
					"utf8"
				);
			} catch (err) {
				// File might not exist
			}
		}

		info.fileName = fileName;

		info.bundleSize = fileSize(Buffer.byteLength(code), format);

		info.brotliSize = showBrotliSize
			? fileSize(await brotli(code), format)
			: "";

		if (showMinifiedSize || showGzippedSize) {
			const minifiedCode = terser.minify(code).code;
			info.minSize = showMinifiedSize
				? fileSize(minifiedCode.length, format)
				: "";
			info.gzipSize = showGzippedSize
				? fileSize(gzip.sync(minifiedCode), format)
				: "";
		}

		if (codeBefore) {
			info.bundleSizeBefore = fileSize(Buffer.byteLength(codeBefore), format);
			info.brotliSizeBefore = showBrotliSize
				? fileSize(await brotli(codeBefore), format)
				: "";
			if (showMinifiedSize || showGzippedSize) {
				const minifiedCode = terser.minify(codeBefore).code;
				info.minSizeBefore = showMinifiedSize
					? fileSize(minifiedCode.length, format)
					: "";
				info.gzipSizeBefore = showGzippedSize
					? fileSize(gzip.sync(minifiedCode), format)
					: "";
			}
		}

		const opts = {
			format,
			theme,
			render,
			showBeforeSizes,
			showGzippedSize,
			showBrotliSize,
			showMinifiedSize,
		};

		if (render) {
			console.warn(
				"`render` is now deprecated. Please use `reporter` instead."
			);
			return opts.render(opts, outputOptions, info);
		}

		const reporters = options.reporter
			? Array.isArray(options.reporter)
				? options.reporter
				: [options.reporter]
			: ["boxen"];

		return (
			await Promise.all(
				reporters.map(async (reporter) => {
					if (typeof reporter === "string") {
						let p;
						if (reporter === "boxen") {
							p = import(
								dirname(new URL(import.meta.url).pathname) +
									"/reporters/boxen.js"
							);
						} else {
							p = import(pathResolve(process.cwd(), reporter));
						}
						reporter = (await p).default;
					}

					return reporter(opts, outputOptions, info);
				})
			)
		).join("");
	};

	if (env === "test") {
		return getLoggingData;
	}

	return {
		name: "filesize",
		async generateBundle(outputOptions, bundle /* , isWrite */) {
			const dataStrs = await Promise.all(
				Object.keys(bundle)
					.map((fileName) => bundle[fileName])
					.filter((currentBundle) => {
						if ({}.hasOwnProperty.call(currentBundle, "type")) {
							return currentBundle.type !== "asset";
						}
						return !currentBundle.isAsset;
					})
					.map((currentBundle) => {
						return getLoggingData(outputOptions, currentBundle);
					})
			);
			dataStrs.forEach((str) => {
				if (str) {
					console.log(str);
				}
			});
		},
	};
}
