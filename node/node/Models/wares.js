const { db } = require('../Schema/config');

const WaresSchema= require('../Schema/wares');

const Wares = db.model('wares', WaresSchema); // User可操作数据库。

module.exports = Wares; // 导出