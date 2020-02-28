const { db } = require('../Schema/config');

const DealsSchema= require('../Schema/deal');

const Deals = db.model('deals', DealsSchema); // User可操作数据库。

module.exports = Deals; // 导出