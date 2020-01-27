const { db } = require('../Schema/config');

const ParentingSubjectSchema = require('../Schema/parentingSubject');

const ParentingSubject = db.model('parentingsubjects', ParentingSubjectSchema); // User可操作数据库。

module.exports = ParentingSubject; // 导出
