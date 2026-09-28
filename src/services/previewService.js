const { execFile } = require('child_process');
const storage = require('./storageService');

function generatePreview(wavKey, slug) {
  return new Promise((resolve, reject) => {
    const inputPath = storage.getPath(wavKey);
    const { fullPath, key } = storage.reserve(`${slug}-preview.mp3`, 'public');

    const args = [
      '-y',
      '-i', inputPath,
      '-codec:a', 'libmp3lame',
      '-b:a', '128k',
      fullPath
    ];

    execFile('ffmpeg', args, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(key);
    });
  });
}

module.exports = { generatePreview };