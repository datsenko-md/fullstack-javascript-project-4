import process from 'process';
import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import * as cheerio from 'cheerio';
import * as f from './functions.js';

const pageLoader = (inputUrl, outputDir = '') => {
  const normalizedInputUrl = inputUrl.replace(/\/$/, '');
  const outputDirPath = path.resolve(process.cwd(), outputDir);
  const htmlFileName = f.getHtmlFileName(normalizedInputUrl);
  const htmlFilePath = path.resolve(outputDirPath, htmlFileName);
  const filesDirName = f.getFilesDirName(normalizedInputUrl);
  const filesDirPath = path.resolve(outputDirPath, filesDirName);
  const url = new URL(normalizedInputUrl);
  const imgLinks = {};

  return fs.access(outputDirPath)
    .catch(() => fs.mkdir(outputDirPath, { recursive: true }))
    .then(() => axios.get(normalizedInputUrl))
    .then((response) => cheerio.load(response.data))
    .then(($) => {
      $('img').each((index, img) => {
        const oldSrc = $(img).attr('src');
        const oldImgPath = f.getImageUrl(oldSrc, url);
        const newImgName = f.getImageFileName(oldImgPath);
        const newImgPath = path.join(filesDirPath, newImgName);
        const newSrc = path.join(filesDirName, newImgName);
        $(img).attr('src', newSrc);
        imgLinks[oldImgPath] = newImgPath;
      });

      return fs.writeFile(htmlFilePath, $.html());
    })
    .then(() => (Object.keys(imgLinks).length > 0 ? fs.mkdir(filesDirPath) : Promise.resolve({})))
    .then(() => Object.keys(imgLinks).map((link) => axios.get(link, { responseType: 'arraybuffer' })))
    .then((promises) => Promise.all(promises))
    .then((responses) => responses.map((response) => fs
      .writeFile(imgLinks[response.config.url], response.data, 'binary')))
    .then((promises) => Promise.all(promises))
    .then(() => htmlFilePath);
};

export default pageLoader;
