import process from 'process';
import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import * as f from './functions.js';

const pageLoader = (url, outputDir = process.cwd()) => {
  const fileName = f.getFileNameFromUrl(url);
  const filePath = path.resolve(process.cwd(), outputDir, fileName);
  return axios.get(url)
    .then((response) => fs.writeFile(filePath, response.data))
    .then(() => filePath);
};

export default pageLoader;
