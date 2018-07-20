import test from 'ava';
import filesize from '../src';

const x = filesize({}, "test");

const code = 'function add(first, second) { return first + second; }';

test('fileSize should return a string', t => {
	t.is(typeof x({dest: 'abc.js'}, code), 'string');
});

test('fileSize should return correct string', t => {
	t.true(x({dest: 'abc.js'}, code).indexOf('54') >= 0)
});

test('fileSize should apply correct template', t => {
	const options = {
		render: function (opts, size) {
			return size;
		}
	};

	const z = filesize(options, "test");
	const expected = '54 B';
	t.is(z({dest: 'abc.js'}, code), expected)
});
