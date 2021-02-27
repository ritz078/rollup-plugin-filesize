"use strict";
module.exports = {
	env: {
		es6: true,
		node: true,
	},
	parser: "@babel/eslint-parser",
	extends: ["eslint:recommended", "plugin:prettier/recommended"],
	parserOptions: {
		requireConfigFile: false,
		ecmaVersion: 2017,
		sourceType: "module",
	},
};
