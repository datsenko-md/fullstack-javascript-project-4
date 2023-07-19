#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../src/pageLoader.js';

const program = new Command();
program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.2')
  .option('-o, --output <path>', 'output dir')
  .argument('<url>', 'URL of page')
  .action((url, options) => {
    try {
      pageLoader(url, options.output)
        .then((data) => {
          console.log(`Page was successfully downloaded into '${data}'`);
          process.exit(0);
        })
        .catch((e) => {
          let message;
          if (e.name === 'AxiosError') {
            message = e.message;
          } else {
            switch (e.code) {
              case 'EACCES':
                message = `You don't have permissions to write file: ${e.path}`;
                break;
              case 'ENOENT':
                message = `No such file or directory: ${e.path}`;
                break;
              case 'ENOTFOUND':
                message = `Page not found: ${e.hostname}`;
                break;
              case 'ERR_BAD_RESPONSE':
                message = `Bad response: ${e.config.url}`;
                break;
              default:
                message = `Unknown error: ${e}`;
            }
          }
          console.error(message);
          process.exit(1);
        });
    } catch (e) {
      let message;
      switch (e.code) {
        case 'ERR_INVALID_URL':
          message = `Invalid URL: ${e.input}`;
          break;
        default:
          message = `Unknown error: ${e}`;
      }
      console.error(message);
      process.exit(1);
    }
  });

program.parse();
