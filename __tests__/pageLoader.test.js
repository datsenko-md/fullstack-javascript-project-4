/* eslint-disable jest/no-conditional-expect */
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
const rootDir = process.cwd();
const filesDir = 'ru-hexlet-io-courses_files';
const htmlName = 'ru-hexlet-io-courses.html';
const imageName = 'ru-hexlet-io-assets-professions-nodejs.png';
const styleName = 'ru-hexlet-io-assets-application.css';
const scriptName = 'ru-hexlet-io-packs-js-runtime.js';

let tmpDir;
let currFilesDir;
let nestedDir;
let currNestedFilesDir;
let responseHtml;
let expectedHtml;
let expectedImage;
let expectedStyle;
let expectedScript;

beforeAll(async () => {
  responseHtml = await fs.readFile(getFixturePath('before.html'), 'utf-8');
  expectedHtml = await fs.readFile(getFixturePath('after.html'), 'utf-8');
  expectedImage = await fs.readFile(getFixturePath('image.png'));
  expectedStyle = await fs.readFile(getFixturePath('style.css'));
  expectedScript = await fs.readFile(getFixturePath('script.js'));
});

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  process.chdir(tmpDir);
  currFilesDir = path.join(process.cwd(), filesDir);
  nestedDir = await fs.mkdtemp(path.join(tmpDir, 'nested-'));
  currNestedFilesDir = path.join(nestedDir, filesDir);
});

afterEach(async () => {
  process.chdir(rootDir);
  await fs.rmdir(tmpDir, { recursive: true });
});

test('pageLoader', async () => {
  nock(/ru\.hexlet\.io/).persist().get(/courses/).reply(200, responseHtml);
  nock(/ru\.hexlet\.io/).get('/assets/professions/nodejs.png').replyWithFile(200, getFixturePath('image.png'));
  nock(/ru\.hexlet\.io/).get('/assets/application.css').replyWithFile(200, getFixturePath('style.css'));
  nock(/ru\.hexlet\.io/).get('/packs/js/runtime.js').replyWithFile(200, getFixturePath('script.js'));

  const actualHtmlPath = await pageLoader(url);
  const actualHtml = await fs.readFile(actualHtmlPath, 'utf-8');
  expect(actualHtml).toEqual(expectedHtml);

  const actualImagePath = path.join(currFilesDir, imageName);
  const actualImage = await fs.readFile(actualImagePath);
  expect(actualImage).toEqual(expectedImage);

  const actualStylePath = path.join(currFilesDir, styleName);
  const actualStyle = await fs.readFile(actualStylePath);
  expect(actualStyle).toEqual(expectedStyle);

  const actualScriptPath = path.join(currFilesDir, scriptName);
  const actualScript = await fs.readFile(actualScriptPath);
  expect(actualScript).toEqual(expectedScript);
});

test('pageLoader custom dir', async () => {
  nock(/ru\.hexlet\.io/).persist().get(/courses/).reply(200, responseHtml);
  nock(/ru\.hexlet\.io/).get('/assets/professions/nodejs.png').replyWithFile(200, getFixturePath('image.png'));
  nock(/ru\.hexlet\.io/).get('/assets/application.css').replyWithFile(200, getFixturePath('style.css'));
  nock(/ru\.hexlet\.io/).get('/packs/js/runtime.js').replyWithFile(200, getFixturePath('script.js'));

  const actualHtmlPath = await pageLoader(url, nestedDir);
  const expectedHtmlPath = path.join(nestedDir, htmlName);

  expect(actualHtmlPath).toEqual(expectedHtmlPath);

  const actualHtml = await fs.readFile(actualHtmlPath, 'utf-8');
  expect(actualHtml).toEqual(expectedHtml);

  const actualImagePath = path.join(currNestedFilesDir, imageName);
  const actualImage = await fs.readFile(actualImagePath);
  expect(actualImage).toEqual(expectedImage);

  const actualStylePath = path.join(currNestedFilesDir, styleName);
  const actualStyle = await fs.readFile(actualStylePath);
  expect(actualStyle).toEqual(expectedStyle);

  const actualScriptPath = path.join(currNestedFilesDir, scriptName);
  const actualScript = await fs.readFile(actualScriptPath);
  expect(actualScript).toEqual(expectedScript);
});

test('pageLoader custom dir relative path', async () => {
  nock(/ru\.hexlet\.io/).persist().get(/courses/).reply(200, responseHtml);
  nock(/ru\.hexlet\.io/).get('/assets/professions/nodejs.png').replyWithFile(200, getFixturePath('image.png'));
  nock(/ru\.hexlet\.io/).get('/assets/application.css').replyWithFile(200, getFixturePath('style.css'));
  nock(/ru\.hexlet\.io/).get('/packs/js/runtime.js').replyWithFile(200, getFixturePath('script.js'));

  const [nestedDirName] = nestedDir.split('/').reverse();

  const actualHtmlPath = await pageLoader(url, nestedDirName);
  const expectedHtmlPath = path.join(nestedDir, htmlName);
  expect(actualHtmlPath).toEqual(expectedHtmlPath);

  const actualHtml = await fs.readFile(actualHtmlPath, 'utf-8');
  expect(actualHtml).toEqual(expectedHtml);

  const actualImagePath = path.join(currNestedFilesDir, imageName);
  const actualImage = await fs.readFile(actualImagePath);
  expect(actualImage).toEqual(expectedImage);

  const actualStylePath = path.join(currNestedFilesDir, styleName);
  const actualStyle = await fs.readFile(actualStylePath);
  expect(actualStyle).toEqual(expectedStyle);

  const actualScriptPath = path.join(currNestedFilesDir, scriptName);
  const actualScript = await fs.readFile(actualScriptPath);
  expect(actualScript).toEqual(expectedScript);
});

test('pageLoader throw errors', async () => {
  await expect(pageLoader(url, '/fake-dir')).rejects.toThrow();
  await expect(pageLoader(url, '/root/fake-dir')).rejects.toThrow();
  try {
    await pageLoader('not-url-at-all');
  } catch (e) {
    expect(e.code).toEqual('ERR_INVALID_URL');
  }

  nock(/ru\.hexlet\.io/).get(/courses1/).reply(100);
  await expect(pageLoader('https://ru.hexlet.io/courses1')).rejects.toThrow();

  nock(/ru\.hexlet2\.io/).get(/courses1/).reply(300);
  await expect(pageLoader('https://ru.hexlet2.io/courses1')).rejects.toThrow();

  nock(/ru\.hexlet3\.io/).get(/courses1/).reply(400);
  await expect(pageLoader('https://ru.hexlet3.io/courses1')).rejects.toThrow();

  nock(/ru\.hexlet4\.io/).get(/courses1/).reply(500);
  await expect(pageLoader('https://ru.hexlet4.io/courses1')).rejects.toThrow();
});
