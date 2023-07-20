import process from 'process';
import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import debug from 'debug';
import Listr from 'listr';
import * as cheerio from 'cheerio';
import * as f from './functions.js';

const pageLoader = (inputUrl, outputDir = '') => {
  const log = debug('page-loader');
  const normalizedInputUrl = f.addSlashToEnd(inputUrl);
  let url;
  try {
    url = new URL(normalizedInputUrl);
  } catch (e) {
    return Promise.reject(e);
  }
  const outputDirPath = path.resolve(process.cwd(), outputDir);
  const htmlFileName = f.getFileName(normalizedInputUrl, url);
  const htmlFilePath = path.resolve(outputDirPath, htmlFileName);
  const filesDirName = f.getFilesDirName(normalizedInputUrl);
  const filesDirPath = path.resolve(outputDirPath, filesDirName);
  const filesLinks = {};

  return fs.access(outputDirPath)
    .then(() => axios.get(inputUrl))
    .then((response) => cheerio.load(response.data))
    .then(($) => {
      const handleFile = (index, element) => {
        const attributes = {
          img: 'src',
          script: 'src',
          link: 'href',
        };
        const attributeName = attributes[element.name];
        const oldSrc = $(element).attr(attributeName);
        const oldFilePath = f.getFileUrl(oldSrc, url);
        const newFileName = f.getFileName(oldFilePath, url);
        const newFilePath = path.join(filesDirPath, newFileName);
        const newSrc = path.join(filesDirName, newFileName);
        if (f.isSameDomain(url.href, oldFilePath)) {
          $(element).attr(attributeName, newSrc);
          filesLinks[oldFilePath] = newFilePath;
          log(`Source handled: ${oldSrc}`);
        }
      };

      $('img').each(handleFile);
      $('script').each(handleFile);
      $('link').each(handleFile);

      return fs.writeFile(htmlFilePath, $.html());
    })
    .then(() => (Object.keys(filesLinks).length > 0 ? fs.mkdir(filesDirPath) : Promise.resolve({})))
    .then(() => {
      const items = Object.keys(filesLinks).map((link) => (
        {
          title: link,
          task: () => axios.get(link, { responseType: 'arraybuffer' })
            .then((response) => fs.writeFile(filesLinks[response.config.url], response.data, 'binary')),
        }
      ));
      const tasks = new Listr(items, { concurrent: true });
      return tasks.run();
    })
    .then(() => htmlFilePath);
};

export default pageLoader;
