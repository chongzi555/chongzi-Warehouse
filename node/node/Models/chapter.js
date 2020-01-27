const { db } = require('../Schema/config');

const ChapterSchema = require('../Schema/chapter');

const Chapter = db.model('chapters', ChapterSchema); // User可操作数据库。

module.exports = Chapter; // 导出
