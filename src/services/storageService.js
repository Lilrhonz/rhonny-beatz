const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'storage', 'public');
const PRIVATE_DIR = path.join(__dirname, '..', '..', 'storage', 'private');

function resolveDir(visibility) {
  if (visibility === 'public') return PUBLIC_DIR;
  if (visibility === 'private') return PRIVATE_DIR;
  throw new Error(`Invalid visibility: ${visibility}`);
}

async function save(buffer, filename, visibility) {
  const dir = resolveDir(visibility);
  const filePath = path.join(dir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `${visibility}/${filename}`;
}

function getPath(key) {
  const [visibility, ...rest] = key.split(/\\|\//);
  const dir = resolveDir(visibility);
  return path.join(dir, ...rest);
}

function reserve(filename, visibility) {
  const dir = resolveDir(visibility);
  return {
    fullPath: path.join(dir, filename),
    key: `${visibility}/${filename}`
  };
}

async function remove(key) {
  const filePath = getPath(key);
  await fs.promises.unlink(filePath);
}

function getSignedUrl(key, expiresInSeconds = 3600) {
  return `/api/downloads/${encodeURIComponent(key)}?expires=${Date.now() + expiresInSeconds * 1000}`;
}

module.exports = { save, getPath, reserve, remove, getSignedUrl };