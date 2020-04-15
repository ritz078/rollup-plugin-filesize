import test from "ava";
import filesize from "../src/index.js";

const x = filesize({}, "test");

const bundle = {
	fileName: "test/fixtures/bundled-file.js",
	code: "function add(first, second) { return first + second; }",
};

async function getStdout(cb) {
	const originalStdoutWrite = process.stdout.write.bind(process.stdout);

	let output = "";
	process.stdout.write = (chunk, encoding, callback) => {
		if (typeof chunk === "string") {
			output += chunk;
		}

		return originalStdoutWrite(chunk, encoding, callback);
	};

	await cb();

	process.stdout.write = originalStdoutWrite;
	return output;
}

test("fileSize should return a string", async (t) => {
	t.is(typeof (await x({ file: "abc.js" }, bundle)), "string");
});

test("fileSize should allow custom reporter", async (t) => {
	const getLoggingData = filesize(
		{
			reporter: "./test/fixtures/customReporter.js",
		},
		"test"
	);
	const val = JSON.parse(await getLoggingData({ file: "abc.js" }, bundle));
	t.deepEqual(val, [
		{
			format: {},
			theme: "dark",
			// reporter: [AsyncFunction: customReporter],
			showBeforeSizes: false,
			showGzippedSize: true,
			showBrotliSize: false,
			showMinifiedSize: true,
		},
		{ file: "abc.js" },
		{
			fileName: "test/fixtures/bundled-file.js",
			bundleSize: "54 B",
			brotliSize: "",
			minSize: "29 B",
			gzipSize: "49 B",
		},
	]);
});

test("fileSize should apply light theme", async (t) => {
	const getLoggingData = filesize({ theme: "light" }, "test");
	const val = await getLoggingData({ file: "abc.js" }, bundle);
	// 30 is for black
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\u001b\[30m\u001b\[1mDestination:/);

	// 34 is for blue
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\u001b\[34mabc\.js/);
});

test("fileSize should apply dark theme", async (t) => {
	const getLoggingData = filesize({ theme: "dark" }, "test");
	const val = await getLoggingData({ file: "abc.js" }, bundle);
	// 32 is for green
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\u001b\[32m\u001b\[1mDestination:/);

	// 33 is for yellow
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\u001b\[33mabc\.js/);
});

test("fileSize should generate a bundle", async (t) => {
	let { name, generateBundle } = filesize();
	t.is(name, "filesize");
	let val = await getStdout(async () => {
		await generateBundle(
			{
				file: "test/fixtures/bundled-file.js",
			},
			{
				"test/fixtures/sample.js": {
					fileName: "test/fixtures/sample.js",
					code: 'console.log("test");\n',
				},
				"some/asset.html": {
					fileName: "some/asset.html",
					code: "<html></html>",
					type: "asset",
				},
			}
		);
	});
	t.regex(val, /Destination:/);
	t.regex(val, /21 B/);

	({ name, generateBundle } = filesize({
		reporter: "./test/fixtures/silentReporter.js",
	}));
	t.is(name, "filesize");
	val = await getStdout(async () => {
		await generateBundle(
			{
				file: "test/fixtures/bundled-file.js",
			},
			{
				"test/fixtures/sample.js": {
					fileName: "test/fixtures/sample.js",
					code: 'console.log("test");\n',
				},
				"some/asset.html": {
					fileName: "some/asset.html",
					code: "<html></html>",
					type: "asset",
				},
			}
		);
	});
	t.is(val, "");
});

test("fileSize should apply `showBeforeSizes` option", async (t) => {
	const getLoggingData = filesize({ showBeforeSizes: true }, "test");
	const val = await getLoggingData(
		{ file: "./test/fixtures/sample.js" },
		bundle
	);
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\(was \u001b\[33m21 B/);
});

test("fileSize should apply `showBeforeSizes` option (with deprecated `dest`)", async (t) => {
	const getLoggingData = filesize({ showBeforeSizes: true }, "test");
	const val = await getLoggingData(
		{ dest: "./test/fixtures/sample.js" },
		bundle
	);
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\(was \u001b\[33m21 B/);
});

test("fileSize should fallback to printing `fileName`", async (t) => {
	const val = await x({}, bundle);
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\u001b\[1mBundle Name:/);
});

test("fileSize should avoid showing minified and gzipped sizes when disabled", async (t) => {
	let getLoggingData = filesize(
		{
			showMinifiedSize: false,
			showGzippedSize: false,
		},
		"test"
	);
	let val = await getLoggingData({}, bundle);
	t.notRegex(val, /Minified Size/);
	t.notRegex(val, /Gzipped Size/);

	getLoggingData = filesize(
		{
			showMinifiedSize: true,
			showGzippedSize: false,
		},
		"test"
	);
	val = await getLoggingData({}, bundle);
	t.regex(val, /Minified Size/);
	t.notRegex(val, /Gzipped Size/);

	getLoggingData = filesize(
		{
			showMinifiedSize: false,
			showGzippedSize: true,
		},
		"test"
	);
	val = await getLoggingData({}, bundle);
	t.notRegex(val, /Minified Size/);
	t.regex(val, /Gzipped Size/);
});

test("fileSize should show Brotli size when configured", async (t) => {
	const getLoggingData = filesize(
		{
			showBrotliSize: true,
		},
		"test"
	);
	const val = await getLoggingData({}, bundle);
	t.regex(val, /Brotli size/);
});

test("fileSize should show before Brotli size when configured", async (t) => {
	let getLoggingData = filesize(
		{
			showBeforeSizes: true,
			showBrotliSize: true,
		},
		"test"
	);
	let val = await getLoggingData({ file: "./test/fixtures/sample.js" }, bundle);
	t.regex(val, /Brotli size/);
	t.regex(val, /Minified Size/);
	t.regex(val, /Gzipped Size/);
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\(was \u001b\[33m25 B/);

	getLoggingData = filesize(
		{
			showBeforeSizes: true,
			showBrotliSize: true,
			showMinifiedSize: false,
			showGzippedSize: false,
		},
		"test"
	);
	val = await getLoggingData({ file: "./test/fixtures/sample.js" }, bundle);
	t.regex(val, /Brotli size/);
	t.notRegex(val, /Minified Size/);
	t.notRegex(val, /Gzipped Size/);
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\(was \u001b\[33m25 B/);

	getLoggingData = filesize(
		{
			showBeforeSizes: true,
			showBrotliSize: true,
			showMinifiedSize: true,
			showGzippedSize: false,
		},
		"test"
	);
	val = await getLoggingData({ file: "./test/fixtures/sample.js" }, bundle);
	t.regex(val, /Brotli size/);
	t.regex(val, /Minified Size/);
	t.notRegex(val, /Gzipped Size/);
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\(was \u001b\[33m25 B/);

	getLoggingData = filesize(
		{
			showBeforeSizes: true,
			showBrotliSize: true,
			showMinifiedSize: false,
			showGzippedSize: true,
		},
		"test"
	);
	val = await getLoggingData({ file: "./test/fixtures/sample.js" }, bundle);
	t.regex(val, /Brotli size/);
	t.notRegex(val, /Minified Size/);
	t.regex(val, /Gzipped Size/);
	// eslint-disable-next-line no-control-regex
	t.regex(val, /\(was \u001b\[33m25 B/);
});

test("fileSize should fallback to printing nothing with no file info", async (t) => {
	const val = await x({}, { ...bundle, fileName: undefined });
	// eslint-disable-next-line no-control-regex
	t.notRegex(val, /\u001b\[1mBundle Name:/);
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
