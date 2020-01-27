const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const AudioSchema = new Schema({
  chapterId: {
    type: ObjectId,
    ref: 'audiochapters', // 关联users集合
  },
  url: String, // 路径
  from:{ // 权限
    type: ObjectId,
    ref: 'users', // 关联users集合
  },
},{versionKey:false,timestamps:{
    createdAt:'created' // 每个用户都带有注册时的时间。
  }});

module.exports = AudioSchema
