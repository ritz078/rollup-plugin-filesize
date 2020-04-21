const boxen = require("boxen");
const colors = require("colors/safe");

export default async function boxenReporter(opt, outputOptions, info) {
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
					)})`,
			  ]
			: [`${title("Bundle Size: ")} ${value(info.bundleSize)}`]),
		...(info.minSize
			? info.minSizeBefore
				? [
						`${title("Minified Size: ")} ${value(info.minSize)} (was ${value(
							info.minSizeBefore
						)})`,
				  ]
				: [`${title("Minified Size: ")} ${value(info.minSize)}`]
			: []),
		...(info.gzipSize
			? info.gzipSizeBefore
				? [
						`${title("Gzipped Size: ")} ${value(info.gzipSize)} (was ${value(
							info.gzipSizeBefore
						)})`,
				  ]
				: [`${title("Gzipped Size: ")} ${value(info.gzipSize)}`]
			: []),
		...(info.brotliSize
			? info.brotliSizeBefore
				? [
						`${title("Brotli size: ")}${value(info.brotliSize)} (was ${value(
							info.brotliSizeBefore
						)})`,
				  ]
				: [`${title("Brotli size: ")}${value(info.brotliSize)}`]
			: []),
	];

	return boxen(values.join("\n"), { padding: 1 });
}
