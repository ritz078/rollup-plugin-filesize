import test from 'ava';
import filesize from '../src';

const x = filesize();

const code = 'Abaculuss velum in secundus cirpi! Sunt amicitiaes imperium peritus, bassus exemplares.';

test('fileSize should return a string', t => {
	t.is(typeof x.getData({dest: 'abc.js'}, code), 'string');
});

test('fileSize should return correct string', t => {
	t.true(x.getData({dest: 'abc.js'}, code).indexOf('87') >= 0)
});

test('fileSize should apply correct template', t => {
	const options = {
		render: function (opts, size) {
			return size;
		}
	};

	const z = filesize(options);
	const expected = '87 B';
	t.is(z.getData({dest: 'abc.js'}, code), expected)
});
