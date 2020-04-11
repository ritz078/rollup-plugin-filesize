import babel from "rollup-plugin-babel";
import filesize from "./src/index";
import pkg from "./package.json";

export default {
	external: ["fs", "util", ...Object.keys(pkg.dependencies)],
	plugins: [
		babel({
			babelrc: false,
			plugins: ["transform-async-to-promises"],
			presets: ["@babel/preset-env"],
		}),
		filesize(),
	],
	input: "src/index.js",
	output: {
		file: "dist/index.js",
		format: "cjs",
	},
};
