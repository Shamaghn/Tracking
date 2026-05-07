const db = require('../config/db');

const createPackage = async (data) => {
  const { user_id, locker, tracking, provider } = data;

  const [result] = await db.execute(
    `INSERT INTO packages (user_id, locker, tracking, provider)
     VALUES (?, ?, ?, ?)`,
    [user_id, locker, tracking, provider]
  );

  return result;
};

module.exports = { createPackage };
