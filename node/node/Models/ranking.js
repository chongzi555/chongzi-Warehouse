const { db } = require('../Schema/config');

const Ranking = require('../Schema/ranking');

const RankingSubject = db.model('rankings', Ranking); // User可操作数据库。

module.exports = RankingSubject; // 导出
