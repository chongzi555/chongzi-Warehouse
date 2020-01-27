const { db } = require('../Schema/config');

const SubjectSchema = require('../Schema/subject');

const Subject = db.model('subjects', SubjectSchema); // User可操作数据库。

module.exports = Subject; // 导出
