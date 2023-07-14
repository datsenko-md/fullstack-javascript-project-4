import path from 'path';

const removeProtocol = (url) => url.replace(/^\/|https?:\/\//, '');
const isLink = (str) => !!str.match(/^https?:\/\//i);
const generateName = (name) => name.replaceAll(/[^a-zA-Z0-9]+/g, '-').replace(/-$/, '');
const getFilesDirName = (url) => `${generateName(removeProtocol(url))}_files`;
const getFileName = (src, base) => {
  const url = new URL(src, base);
  const ext = path.extname(url.pathname) || '.html';
  const withoutExt = url.href.replace(/^https?:\/\//, '').replace(ext, '');
  return `${generateName(withoutExt)}${ext}`;
};
const getFileUrl = (src, url) => {
  if (isLink(src)) {
    return src;
  }
  const key = src.startsWith('/') ? 'origin' : 'href';
  const normalizedSrc = src.replace(/\/$/, '');
  const base = `${url[key]}/`.replace(/\/\/$/, '/');
  const result = new URL(normalizedSrc, base);
  return result.href;
};

const isSameDomain = (baseLink, link) => {
  const baseUrl = new URL(baseLink);
  const newUrl = new URL(link, baseUrl);
  return newUrl.origin === baseUrl.origin;
};

const addSlashToEnd = (url) => `${url}/`.replace(/\/\/$/, '/');

export {
  getFilesDirName,
  getFileName,
  getFileUrl,
  isSameDomain,
  addSlashToEnd,
};
