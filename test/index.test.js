import test from "ava";
import filesize from "../src/index.js";

const x = filesize({}, "test");

const bundle = {
	fileName: "bundled-file.js",
	code: "function add(first, second) { return first + second; }",
};

test("fileSize should return a string", async (t) => {
	t.is(typeof (await x({ file: "abc.js" }, bundle)), "string");
});

test("fileSize should return a string (with deprecated `dest`)", async (t) => {
	t.is(typeof (await x({ dest: "abc.js" }, bundle)), "string");
});

test("fileSize should return correct string", async (t) => {
	t.true((await x({ file: "abc.js" }, bundle)).indexOf("54") >= 0);
});

test("fileSize should apply correct template", async (t) => {
	const options = {
		reporter: [
			function (opts, bundle, { gzipSize }) {
				return gzipSize;
			},
		],
	};

	const z = filesize(options, "test");
	const expected = "49 B";
	console.log(await z({ file: "abc.js" }, bundle));
	t.is(await z({ file: "abc.js" }, bundle), expected);
});

test("fileSize should report size to reporters", async (t) => {
	let size;
	const options = {
		reporter: [
			function (opts, bundle, { gzipSize }) {
				size = gzipSize;
			},
		],
	};

	const z = filesize(options, "test");
	const expected = "49 B";
	console.log(await z({ file: "abc.js" }, bundle));
	t.is(size, expected);
});
