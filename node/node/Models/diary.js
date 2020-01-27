const { db } = require('../Schema/config');

const DiarySchema = require('../Schema/diary');

const Diary = db.model('diaries', DiarySchema); // User可操作数据库。

module.exports = Diary; // 导出