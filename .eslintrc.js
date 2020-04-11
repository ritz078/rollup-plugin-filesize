"use strict";
module.exports = {
	env: {
		es6: true,
		node: true,
	},
	extends: ["eslint:recommended", "plugin:prettier/recommended"],
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: "module",
	},
};
