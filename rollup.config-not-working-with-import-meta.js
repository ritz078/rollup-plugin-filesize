import babel from "rollup-plugin-babel";
import filesize from "./src/index.js";
import pkg from "./package.json";

const reporters = ["boxen"];

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
