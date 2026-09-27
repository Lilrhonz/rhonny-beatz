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
  return path.join(visibility, filename); // stored "key" you save in the DB
}

function getPath(key) {
  // key looks like "public/cover.jpg" or "private/beat.wav"
  const [visibility, ...rest] = key.split(path.sep === '\\' ? /\\|\// : '/');
  const dir = resolveDir(visibility);
  return path.join(dir, ...rest);
}

async function remove(key) {
  const filePath = getPath(key);
  await fs.promises.unlink(filePath);
}

function getSignedUrl(key, expiresInSeconds = 3600) {
  // Placeholder for local dev — real signed URLs come when we move to cloud storage.
  // For now, this just returns a path our own server route will handle directly.
  return `/api/downloads/${encodeURIComponent(key)}?expires=${Date.now() + expiresInSeconds * 1000}`;
}

module.exports = { save, getPath, remove, getSignedUrl };