const { db } = require('../Schema/config');

const RankSchema = require('../Schema/rank');

const Rank = db.model('ranks', RankSchema); // User可操作数据库。

module.exports = Rank; // 导出
