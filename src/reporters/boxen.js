const boxen = require("boxen");
const colors = require("colors/safe");

export default async function boxenReporter(opt, outputOptions, info) {
	const primaryColor = opt.theme === "dark" ? "green" : "black";
	const secondaryColor = opt.theme === "dark" ? "yellow" : "blue";

	const title = colors[primaryColor].bold;
	const value = colors[secondaryColor];

	const values = [
		...(outputOptions.file || outputOptions.dest
			? [
					`${title("Destination: ")}${value(
						outputOptions.file || outputOptions.dest
					)}`,
			  ]
			: info.fileName
			? [`${title("Bundle Name: ")} ${value(info.fileName)}`]
			: []),
		...(info.bundleSizeBefore
			? [
					`${title("Bundle Size: ")} ${value(info.bundleSize)} (was ${value(
						info.bundleSizeBefore
					)} in version ${info.lastVersion})`,
			  ]
			: [`${title("Bundle Size: ")} ${value(info.bundleSize)}`]),
		...(info.minSize
			? info.minSizeBefore
				? [
						`${title("Minified Size: ")} ${value(info.minSize)} (was ${value(
							info.minSizeBefore
						)} in version ${info.lastVersion})`,
				  ]
				: [`${title("Minified Size: ")} ${value(info.minSize)}`]
			: []),
		...(info.gzipSize
			? info.gzipSizeBefore
				? [
						`${title("Gzipped Size: ")} ${value(info.gzipSize)} (was ${value(
							info.gzipSizeBefore
						)} in version ${info.lastVersion})`,
				  ]
				: [`${title("Gzipped Size: ")} ${value(info.gzipSize)}`]
			: []),
		...(info.brotliSize
			? info.brotliSizeBefore
				? [
						`${title("Brotli size: ")}${value(info.brotliSize)} (was ${value(
							info.brotliSizeBefore
						)} in version ${info.lastVersion})`,
				  ]
				: [`${title("Brotli size: ")}${value(info.brotliSize)}`]
			: []),
	];

	return boxen(values.join("\n"), { padding: 1 });
}
