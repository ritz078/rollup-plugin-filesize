import "regenerator-runtime/runtime.js";
import test from "ava";
import filesize from "../src";

const x = filesize({}, "test");

const bundle = {
	fileName: "bundled-file.js",
	code: "function add(first, second) { return first + second; }"
};

test("fileSize should return a string", async t => {
	t.is(typeof (await x({ dest: "abc.js" }, bundle)), "string");
});

test("fileSize should return correct string", async t => {
	t.true((await x({ dest: "abc.js" }, bundle)).indexOf("54") >= 0);
});

test("fileSize should apply correct template", async t => {
	const options = {
		render: function(opts, bundle, { gzipSize }) {
			return gzipSize;
		}
	};

	const z = filesize(options, "test");
	const expected = "49 B";
	console.log(await z({ dest: "abc.js" }, bundle));
	t.is(await z({ dest: "abc.js" }, bundle), expected);
});
