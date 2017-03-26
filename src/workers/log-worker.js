'use strict';
const elegantSpinner = require('elegant-spinner');
const logUpdate = require('log-update');
const chalk = require('chalk');
let frame = elegantSpinner();
let text = 'Building';

let running = false;
let startTime;

const time = () => {
  return new Date().toLocaleTimeString();
};

const now = () => {
  return Date.now();
};

let interval = () => {
  setInterval(() => {
    if (running) {
      logUpdate(`[${time()}] ${text} ${frame()}`);
    }
  }, 50);
};
process.on('message', message => {
  if (message === 'start') {
    running = true;
    startTime = now();
    interval();
  } else if (message === 'pauze') {
    running = false;
  } else if (message === 'resume') {
    running = true;
  } else if (message.includes('finished')) {
    frame = () => {
      return '';
    };
    let period = now() - startTime;
    period /= 1000;
    text = `${message} after: ${chalk.magenta(period + ' sec')}`;
  } else {
    text = message;
  }
});
