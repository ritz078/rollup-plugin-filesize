import { promisify } from "util";
import test from "ava";
import rimRaf from "rimraf";
import colors from "colors/safe";
import filesize from "../src/index.js";

const rimraf = promisify(rimRaf);

const x = filesize({}, "test");

const bundle = {
	fileName: "test/fixtures/bundled-file.js",
	code: "function add(first, second) { return first + second; }",
};

async function removeCacheDir() {
	return await rimraf(".cache");
}

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

test("fileSize should return a string (with deprecated `dest`)", async (t) => {
	t.is(typeof (await x({ dest: "abc.js" }, bundle)), "string");
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
			showBeforeSizes: "none",
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

	if (colors.supportsColor()) {
		// 30 is for black
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\u001b\[30m\u001b\[1mDestination:/);

		// 34 is for blue
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\u001b\[34mabc\.js/);
	} else {
		t.regex(val, /Destination:/);
		t.regex(val, /abc\.js/);
	}
});

test("fileSize should apply dark theme", async (t) => {
	const getLoggingData = filesize({ theme: "dark" }, "test");
	const val = await getLoggingData({ file: "abc.js" }, bundle);

	if (colors.supportsColor()) {
		// 32 is for green
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\u001b\[32m\u001b\[1mDestination:/);

		// 33 is for yellow
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\u001b\[33mabc\.js/);
	} else {
		t.regex(val, /Destination:/);
		t.regex(val, /abc\.js/);
	}
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
	const getLoggingData = filesize({ showBeforeSizes: "release" }, "test");
	const val = await getLoggingData({ file: "./dist/index.js" }, bundle);
	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\(was \u001b\[33m[\d.]+ KB/);
	} else {
		t.regex(val, /\(was [\d.]+ KB/);
	}
});

test('fileSize should apply `showBeforeSizes` option as "build"', async (t) => {
	await removeCacheDir();

	const getLoggingData = filesize({ showBeforeSizes: "build" }, "test");
	const val = await getLoggingData({ file: "./dist/index.js" }, bundle);
	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\(was \u001b\[33m[\d.]+ K?B/);
	} else {
		t.regex(val, /\(was [\d.]+ K?B/);
	}
});

test('fileSize should ignore before sizes with package-missing file and `showBeforeSizes: "release"`', async (t) => {
	await removeCacheDir();

	let getLoggingData = filesize({ showBeforeSizes: "release" }, "test");
	let val = await getLoggingData({ file: "./test/fixtures/sample.js" }, bundle);
	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.notRegex(val, /\(was /);
	} else {
		t.notRegex(val, /\(was /);
	}

	// Run again (without deleting cache directory) to get coverage of cache
	getLoggingData = filesize({ showBeforeSizes: "release" }, "test");
	val = await getLoggingData({ file: "./test/fixtures/sample.js" }, bundle);
	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.notRegex(val, /\(was /);
	} else {
		t.notRegex(val, /\(was /);
	}
});

test("fileSize should ignore before sizes with bad package", async (t) => {
	await removeCacheDir();

	const oldCwd = process.cwd();
	const getLoggingData = filesize({ showBeforeSizes: "release" }, "test");

	// Change directory without giving a chance for other tests to use
	process.chdir("./test/fixtures");
	const prom = getLoggingData({ file: "./sample.js" }, bundle);
	process.chdir(oldCwd);
	const val = await prom;

	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.notRegex(val, /\(was /);
	} else {
		t.notRegex(val, /\(was /);
	}
});

test("fileSize should apply `showBeforeSizes` option (with deprecated `dest`)", async (t) => {
	const getLoggingData = filesize({ showBeforeSizes: "release" }, "test");
	const val = await getLoggingData({ dest: "./dist/index.js" }, bundle);
	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\(was \u001b\[33m[\d.]+ KB/);
	} else {
		t.regex(val, /\(was [\d.]+ KB/);
	}
});

test("fileSize should fallback to printing `fileName`", async (t) => {
	const val = await x({}, bundle);
	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\u001b\[1mBundle Name:/);
	} else {
		t.regex(val, /Bundle Name:/);
	}
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
			showBeforeSizes: "build",
			showBrotliSize: true,
		},
		"test"
	);
	let val = await getLoggingData({ file: "./test/fixtures/sample.js" }, bundle);
	t.regex(val, /Brotli size/);
	t.regex(val, /Minified Size/);
	t.regex(val, /Gzipped Size/);

	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\(was \u001b\[33m25 B/);
	} else {
		t.regex(val, /\(was 25 B/);
	}

	getLoggingData = filesize(
		{
			showBeforeSizes: "build",
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
	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\(was \u001b\[33m25 B/);
	} else {
		t.regex(val, /\(was 25 B/);
	}

	getLoggingData = filesize(
		{
			showBeforeSizes: "build",
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

	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\(was \u001b\[33m25 B/);
	} else {
		t.regex(val, /\(was 25 B/);
	}

	getLoggingData = filesize(
		{
			showBeforeSizes: "build",
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
	if (colors.supportsColor()) {
		// eslint-disable-next-line no-control-regex
		t.regex(val, /\(was \u001b\[33m25 B/);
	} else {
		t.regex(val, /\(was 25 B/);
	}
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

test("fileSize should apply correct template (using deprecated `render`)", async (t) => {
	const options = {
		render: function (opts, bundle, { gzipSize }) {
			return gzipSize;
		},
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
