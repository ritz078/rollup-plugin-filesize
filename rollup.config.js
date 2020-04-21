import babel from "rollup-plugin-babel";
import pkg from "./package.json";

const reporters = ["boxen"];

let filesize = () => {};
try {
	// We can't point to ESM source here due to this pre-Node13 config (even if
	//  switched to the expected .mjs extension), being transpiled and then executed,
	//  causing `import.meta.url` (which we use to discover the relative reporter path)
	//  to reflect the rollup config file path instead of source (or dist).
	// See discussion at https://github.com/rollup/rollup/pull/3445
	filesize = require("./dist/index.js");
} catch (err) {
	// We can't use the first time, with the file not yet built
}

export default [
	{
		external: ["path", "fs", "util", ...Object.keys(pkg.dependencies)],
		plugins: [
			babel({
				babelrc: false,
				plugins: ["@babel/plugin-syntax-import-meta"],
				presets: [["@babel/preset-env", { targets: { node: 8 } }]],
			}),
			filesize(),
		],
		input: "src/index.js",
		output: {
			sourcemap: true,
			file: `dist/index.js`,
			format: "cjs",
		},
	},
	...reporters.map((reporter) => {
		return {
			plugins: [
				babel({
					babelrc: false,
					presets: [["@babel/preset-env", { targets: { node: 8 } }]],
				}),
				filesize(),
			],
			input: `src/reporters/${reporter}`,
			output: {
				exports: "named",
				sourcemap: true,
				file: `dist/reporters/${reporter}.js`,
				format: "cjs",
			},
		};
	}),
];
