
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  return 'LOCK-' + uuidv4().split('-')[0].toUpperCase();
};
