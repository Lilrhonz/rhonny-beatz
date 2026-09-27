const storage = require('./src/services/storageService');

async function test() {
  const key = await storage.save(Buffer.from('hello world'), 'test.txt', 'public');
  console.log('Saved with key:', key);
  console.log('Resolved path:', storage.getPath(key));
}

test();
