import test from 'ava';
import Chalk from 'chalk';
import boxen from 'boxen';
import filesize from '../src';

const x = filesize();

const code = 'Abaculuss velum in secundus cirpi! Sunt amicitiaes imperium peritus, bassus exemplares.';

test('fileSize should return a string', t => {
	t.ok(typeof x.transformBundle(code).log === 'string');
});

test('fileSize should return correct string', t => {
	t.ok(x.transformBundle(code).log.indexOf('87') >= 0)
});

test('fileSize should apply correct theme based on settings', t => {
	const options  = {
		theme: 'light'
	};
	const chalk    = new Chalk.constructor({ enabled: true });
	const y        = filesize(options);
	const expected = boxen(chalk.black.bold('Bundle size : ') + chalk.blue.bold('87 B') + ', '+
		chalk.black.bold('Gzipped size : ') + chalk.blue.bold('93 B') , { padding: 1 });

	t.ok(y.transformBundle(code).log === expected);
});

test('fileSize should apply correct template', t => {
	const options = {
		render: function (opts, size) {
			return size;
		}
	};

	const z = filesize(options);
	const expected = '87 B';
	t.ok(z.transformBundle(code).log === expected)
});
