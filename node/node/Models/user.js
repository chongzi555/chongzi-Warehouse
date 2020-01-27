const { db } = require('../Schema/config');

const UserSchema = require('../Schema/user');

const User = db.model('users', UserSchema); // User可操作数据库。

module.exports = User; // 导出