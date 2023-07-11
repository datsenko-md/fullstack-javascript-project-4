import * as f from '../src/functions.js';

test('getFileNameFromUrl', () => {
  const url = 'https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname?q=value';
  const expected = 'developer-mozilla-org-en-US-docs-Web-API-URL-pathname-q-value.html';
  expect(f.getFileNameFromUrl(url)).toEqual(expected);
});
