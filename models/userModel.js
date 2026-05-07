
const db = require('../config/db');

const createUser = async (user) => {
  const { name, email, password, role, locker } = user;
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, role, locker) VALUES (?, ?, ?, ?, ?)',
    [name, email, password, role, locker]
  );
  return result;
};

const getUserByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

module.exports = { createUser, getUserByEmail };
