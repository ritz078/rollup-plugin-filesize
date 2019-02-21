import test from 'ava';
import filesize from '../src';

const x = filesize({}, "test");

const bundle = {
  fileName: 'bundled-file.js',
  code: 'function add(first, second) { return first + second; }',
};

test('fileSize should return a string', t => {
	t.is(typeof x({dest: 'abc.js'}, bundle), 'string');
});

test('fileSize should return correct string', t => {
	t.true(x({dest: 'abc.js'}, bundle).indexOf('54') >= 0)
});

test('fileSize should apply correct template', t => {
	const options = {
		render: function (opts, bundle, { gzipSize }) {
			return gzipSize;
		}
	};

	const z = filesize(options, "test");
	const expected = '49 B';
	console.log(z({dest: 'abc.js'}, bundle))
	t.is(z({dest: 'abc.js'}, bundle), expected)
});
