const { db } = require('../Schema/config');

const CourseSchema = require('../Schema/course');

const Course = db.model('courses', CourseSchema); // User可操作数据库。

module.exports = Course; // 导出
