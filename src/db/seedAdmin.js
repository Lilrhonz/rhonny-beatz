require('dotenv').config();
const readline = require('readline');
const db = require('./connection');
const { hashPassword } = require('../services/authService');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function seedAdmin() {
  const email = await ask('Admin email: ');
  const password = await ask('Admin password: ');
  rl.close();

  const hash = await hashPassword(password);

  try {
    await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, hash, 'admin']
    );
    console.log(`Admin account created for ${email}`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('That email is already registered.');
    } else {
      console.error('Failed to create admin:', err.message);
    }
  } finally {
    process.exit();
  }
}

seedAdmin();