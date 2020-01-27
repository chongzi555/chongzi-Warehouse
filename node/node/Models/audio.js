const { db } = require('../Schema/config');

const AudiosSchema = require('../Schema/audio');

const Audio = db.model('audios', AudiosSchema); // User可操作数据库。

module.exports = Audio; // 导出
