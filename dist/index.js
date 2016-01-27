'use strict';

function _interopDefault (ex) { return 'default' in ex ? ex['default'] : ex; }

var fileSize = _interopDefault(require('filesize'));
var boxen = _interopDefault(require('boxen'));
var Chalk = _interopDefault(require('chalk'));

var chalk = new Chalk.constructor({ enabled: true });

function filesize() {
    return {
        transformBundle: function transformBundle(code) {
            console.log(boxen(chalk.green.bold('Bundle size : ') + chalk.yellow.bold(fileSize(Buffer.byteLength(code))), { padding: 1 }));
        }
    };
};

module.exports = filesize;