"use strict";
module.exports = {
	env: {
		es6: true,
		node: true,
	},
	parser: "babel-eslint",
	extends: ["eslint:recommended", "plugin:prettier/recommended"],
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: "module",
	},
};
