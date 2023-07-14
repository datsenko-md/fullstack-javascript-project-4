import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import process from 'process';
import nock from 'nock';
import os from 'os';

import pageLoader from '../src/pageLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

nock.disableNetConnect();

const url = 'https://ru.hexlet.io/courses';
const fileName = 'ru-hexlet-io-courses.html';
const filesDir = 'ru-hexlet-io-courses_files';
const imageName = 'ru-hexlet-io-assets-professions-nodejs.png';
const rootDir = process.cwd();

let tmpDir;
let expected;
let responseHtml;
let image;

beforeAll(async () => {
  expected = await fs.readFile(getFixturePath('after.html'), 'utf-8');
  responseHtml = await fs.readFile(getFixturePath('before.html'), 'utf-8');
  image = await fs.readFile(getFixturePath('image.png'));
});

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  process.chdir(tmpDir);
});

afterEach(async () => {
  process.chdir(rootDir);
  await fs.rmdir(tmpDir, { recursive: true });
});

test('pageLoader', async () => {
  nock(/ru\.hexlet\.io/).get(/courses/).reply(200, responseHtml);
  nock(/ru\.hexlet\.io/).get('/assets/professions/nodejs.png').replyWithFile(200, getFixturePath('image.png'));
  nock(/ru\.hexlet2\.io/).get('/assets/professions/nodejs2.png').replyWithFile(200, getFixturePath('image2.png'));
  const filePath = await pageLoader(url);

  const expectedFilePath = path.join(process.cwd(), fileName);
  expect(filePath).toEqual(expectedFilePath);

  const actual = await fs.readFile(filePath, 'utf-8');
  expect(actual).toEqual(expected);

  const actualImagePath = path.join(process.cwd(), filesDir, imageName);
  const actualImage = await fs.readFile(actualImagePath);
  expect(actualImage).toEqual(image);
});

test('pageLoader custom dir', async () => {
  nock(/ru\.hexlet\.io/).get(/courses/).reply(200, responseHtml);
  nock(/ru\.hexlet\.io/).get('/assets/professions/nodejs.png').replyWithFile(200, getFixturePath('image.png'));
  nock(/ru\.hexlet2\.io/).get('/assets/professions/nodejs2.png').replyWithFile(200, getFixturePath('image2.png'));
  const customDir = await fs.mkdtemp(path.join(tmpDir, 'nested-'));
  const [nestedDirName] = customDir.split('/').reverse();
  const filePath = await pageLoader(url, customDir);

  const expectedFilePath = path.join(process.cwd(), nestedDirName, fileName);
  expect(filePath).toEqual(expectedFilePath);

  const actual = await fs.readFile(filePath, 'utf-8');
  expect(actual).toEqual(expected);

  const actualImagePath = path.join(process.cwd(), nestedDirName, filesDir, imageName);
  const actualImage = await fs.readFile(actualImagePath);
  expect(actualImage).toEqual(image);
});

test('pageLoader custom dir relative path', async () => {
  nock(/ru\.hexlet\.io/).get(/courses/).reply(200, responseHtml);
  nock(/ru\.hexlet\.io/).get('/assets/professions/nodejs.png').replyWithFile(200, getFixturePath('image.png'));
  nock(/ru\.hexlet2\.io/).get('/assets/professions/nodejs2.png').replyWithFile(200, getFixturePath('image2.png'));
  const customDir = await fs.mkdtemp(path.join(tmpDir, 'nested-'));
  const [nestedDirName] = customDir.split('/').reverse();
  const filePath = await pageLoader(url, nestedDirName);

  const expectedFilePath = path.join(process.cwd(), nestedDirName, fileName);
  expect(filePath).toEqual(expectedFilePath);

  const actual = await fs.readFile(filePath, 'utf-8');
  expect(actual).toEqual(expected);

  const actualImagePath = path.join(process.cwd(), nestedDirName, filesDir, imageName);
  const actualImage = await fs.readFile(actualImagePath);
  expect(actualImage).toEqual(image);
});
