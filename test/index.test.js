import test from 'ava'
import filesize from '../src';

const x = filesize();

const code = 'Abaculuss velum in secundus cirpi! Sunt amicitiaes imperium peritus, bassus exemplares.';

test('fileSize should return a string', t => {
	t.ok(typeof x.transformBundle(code) === 'string');
});

test('fileSize should return correct string', t => {
	t.ok(x.transformBundle(code).indexOf('87') >= 0)
});
