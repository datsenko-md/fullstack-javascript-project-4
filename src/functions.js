const getFileNameFromUrl = (url) => {
  const { host, pathname, search } = new URL(url);
  return `${host}${pathname}${search}`.replaceAll(/[^a-zA-Z0-9]+/g, '-').concat('.html');
};

export {
  // eslint-disable-next-line import/prefer-default-export
  getFileNameFromUrl,
};
