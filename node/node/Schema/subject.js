const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const ChapterSchema = new Schema({
  courseId: {
    type: ObjectId,
    ref: 'courses', // 关联users集合
  },
  chapterId: {
    type: ObjectId,
    ref: 'chapters', // 关联users集合
  },
  type: Number, // 类型
  problem: String, // 问题
  option1: String, // option选项
  option2: String,
  option3: String,
  option4: String,
  index: Number, // 答案索引；
  from:{ // 权限
    type: ObjectId,
    ref: 'users', // 关联users集合
  },
},{versionKey:false,timestamps:{
    createdAt:'created' // 每个用户都带有注册时的时间。
  }});

module.exports = ChapterSchema
