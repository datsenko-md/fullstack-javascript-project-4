import path from 'path';

const removeProtocol = (url) => url.replace(/^\/|https?:\/\//, '');
const isLink = (str) => !!str.match(/^https?:\/\//i);
const generateName = (name) => name.replaceAll(/[^a-zA-Z0-9]+/g, '-');
const getHtmlFileName = (url) => `${generateName(removeProtocol(url))}.html`;
const getFilesDirName = (url) => `${generateName(removeProtocol(url))}_files`;
const getImageFileName = (url) => {
  const normalized = url.replace(/^\/|https?:\/\//, '');
  const ext = path.extname(url);
  const withoutExt = normalized.replace(ext, '');
  return `${generateName(withoutExt)}${ext}`;
};
const getImageUrl = (src, url) => {
  if (isLink(src)) {
    return src;
  }
  const key = src.startsWith('/') ? 'origin' : 'href';
  const normalizedSrc = src.replace(/\/$/, '');
  const base = `${url[key]}/`.replace(/\/\/$/, '/');
  const result = new URL(normalizedSrc, base);
  return result.href;
};

export {
  getHtmlFileName,
  getFilesDirName,
  getImageFileName,
  getImageUrl,
};
