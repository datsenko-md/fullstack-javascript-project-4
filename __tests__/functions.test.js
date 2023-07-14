import * as f from '../src/functions.js';

test('getFilesDirName', () => {
  const url = 'https://ru.hexlet.io/courses';
  const expected = 'ru-hexlet-io-courses_files';
  expect(f.getFilesDirName(url)).toEqual(expected);
});

test('getImageFileName', () => {
  const base = 'https://ru.hexlet.io/courses/';
  const url1 = 'portrait.jpg';
  const url2 = '/folder/portrait.js';
  const url3 = 'https://site.com/folder/portrait.css';
  const url4 = 'https://www.brizk.com';

  expect(f.getFileName(url1, base)).toEqual('ru-hexlet-io-courses-portrait.jpg');
  expect(f.getFileName(url2, base)).toEqual('ru-hexlet-io-folder-portrait.js');
  expect(f.getFileName(url3, base)).toEqual('site-com-folder-portrait.css');
  expect(f.getFileName(url4, base)).toEqual('www-brizk-com.html');
});

test.each([
  ['portrait.jpg', 'https://ru.hexlet.io/courses/portrait.jpg'],
  ['/assets/portrait.jpg', 'https://ru.hexlet.io/assets/portrait.jpg'],
  ['https://site.com/page/portrait.jpg', 'https://site.com/page/portrait.jpg'],
])('%s', (src, expected) => {
  const url = new URL('https://ru.hexlet.io/courses');
  expect(f.getFileUrl(src, url)).toEqual(expected);
});

test.each([
  ['https://ru.hexlet.io/courses', 'https://ru.hexlet.io/assets', true],
  ['https://ru.hexlet.io/courses', 'https://cdn2.hexlet.io/assets', false],
  ['https://ru.hexlet.io/courses', '/assets/files', true],
  ['https://ru.hexlet.io/courses', 'path/to/file.png', true],
])('%s and %s', (url1, url2, expected) => {
  expect(f.isSameDomain(url1, url2)).toEqual(expected);
});

test('addSlashToEnd', () => {
  expect(f.addSlashToEnd('https://site.com')).toEqual('https://site.com/');
  expect(f.addSlashToEnd('https://site.com/')).toEqual('https://site.com/');
});
