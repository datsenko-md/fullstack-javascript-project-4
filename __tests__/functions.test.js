import * as f from '../src/functions.js';

test('getHtmlFileName', () => {
  const url = 'https://ru.hexlet.io/courses';
  const expected = 'ru-hexlet-io-courses.html';
  expect(f.getHtmlFileName(url)).toEqual(expected);
});

test('getFilesDirName', () => {
  const url = 'https://ru.hexlet.io/courses';
  const expected = 'ru-hexlet-io-courses_files';
  expect(f.getFilesDirName(url)).toEqual(expected);
});

test('getImageFileName', () => {
  const url1 = 'portrait.jpg';
  const url2 = '/folder/portrait.jpg';
  const url3 = 'https://site.com/folder/portrait.jpg';

  expect(f.getImageFileName(url1)).toEqual('portrait.jpg');
  expect(f.getImageFileName(url2)).toEqual('folder-portrait.jpg');
  expect(f.getImageFileName(url3)).toEqual('site-com-folder-portrait.jpg');
});

test.each([
  ['portrait.jpg', 'https://ru.hexlet.io/courses/portrait.jpg'],
  ['/assets/portrait.jpg', 'https://ru.hexlet.io/assets/portrait.jpg'],
  ['https://site.com/page/portrait.jpg', 'https://site.com/page/portrait.jpg'],
])('%s', (src, expected) => {
  const url = new URL('https://ru.hexlet.io/courses');
  expect(f.getImageUrl(src, url)).toEqual(expected);
});
