const { db } = require('../Schema/config');

const parentingSchema = require('../Schema/parentingChapter');

const parentingChapter = db.model('parentingchapters', parentingSchema); // User可操作数据库。

module.exports = parentingChapter; // 导出
