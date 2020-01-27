const { db } = require('../Schema/config');

const AudioSchema = require('../Schema/audioChapter');

const AudioChapter = db.model('audiochapters', AudioSchema); // User可操作数据库。

module.exports = AudioChapter; // 导出
