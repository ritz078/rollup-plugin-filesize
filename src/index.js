import { readFile as origReadFile } from "fs";
import { promisify } from "util";
import { dirname } from "path";

import fileSize from "filesize";
import gzip from "gzip-size";
import terser from "terser";
import brotli from "brotli-size";

const readFile = promisify(origReadFile);

export default function filesize(options = {}, env) {
	let {
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

		info.brotliSize = showBrotliSize ? fileSize(brotli.sync(code), format) : "";

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
				? fileSize(brotli.sync(codeBefore), format)
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

		const reporters = options.reporter || ["boxen"];

		return (
			await Promise.all(
				reporters.map(async (reporter) => {
					if (typeof reporter === "string") {
						if (reporter === "boxen") {
							reporter = "/reporters/boxen.js";
						}
						reporter = (
							await import(
								dirname(new URL(import.meta.url).pathname) + reporter
							)
						).default;
					}
					return reporter(
						{
							format,
							theme,
							reporter,
							showBeforeSizes,
							showGzippedSize,
							showBrotliSize,
							showMinifiedSize,
						},
						outputOptions,
						info
					);
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
