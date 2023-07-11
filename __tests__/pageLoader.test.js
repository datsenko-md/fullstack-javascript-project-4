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

const url = 'https://en.wikipedia.org/wiki/Krishna';
const expectedFileName = 'en-wikipedia-org-wiki-Krishna.html';
const rootDir = process.cwd();
let tmpDir;
let expected;

beforeAll(async () => {
  expected = await fs.readFile(getFixturePath(expectedFileName), 'utf-8');
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
  nock(/en\.wikipedia\.org/).get(/wiki\/Krishna/).reply(200, expected);
  const filePath = await pageLoader(url);
  const actual = await fs.readFile(filePath, 'utf-8');
  expect(actual).toEqual(expected);
});

test('pageLoader custom dir', async () => {
  nock(/en\.wikipedia\.org/).get(/wiki\/Krishna/).reply(200, expected);
  const customDir = await fs.mkdtemp(path.join(tmpDir, 'nested'));
  const filePath = await pageLoader(url, customDir);
  const actual = await fs.readFile(filePath, 'utf-8');
  expect(actual).toEqual(expected);
});

test('pageLoader custom dir relative path', async () => {
  nock(/en\.wikipedia\.org/).get(/wiki\/Krishna/).reply(200, expected);
  const customDir = await fs.mkdtemp(path.join(tmpDir, 'nested'));
  const [dirName] = customDir.split('/').reverse();
  const filePath = await pageLoader(url, dirName);
  const actual = await fs.readFile(filePath, 'utf-8');
  expect(actual).toEqual(expected);
});
