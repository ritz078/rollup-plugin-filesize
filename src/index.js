import fileSize from 'filesize';
import boxen from 'boxen';
import Chalk from 'chalk';

var chalk = new Chalk({enabled:true});

export default function filesize(){
    return {
        transformBundle(code){
            console.log(boxen(chalk.green.bold('Bundle size : ') + chalk.yellow.bold(fileSize(Buffer.byteLength(code))), {padding:1}));
        }
    }
};