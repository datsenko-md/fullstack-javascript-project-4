#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../src/pageLoader.js';

const program = new Command();
program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .option('-o, --output <path>', 'output dir')
  .argument('<url>', 'URL of page')
  .action((url, options) => {
    pageLoader(url, options.output).then(console.log);
  });

program.parse();
