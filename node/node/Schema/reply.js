const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const ReplySchema = new Schema({
  author:{ // 回复的用户。id
    type: ObjectId,
    ref: 'users',
  },
  ware:{ // 回复对应的日记。
    type:ObjectId,
    ref: 'wares',
  },
  comment:{ // 关联评论集合
    type:ObjectId,
    ref: 'comments',
  },
  reply_id:{ // 回复 要 回复的那个人的id
    type:ObjectId,
    ref: 'users'
  },
  reply_con: String,
},{versionKey:false,timestamps:{
    createdAt:'created'
  }})

module.exports = ReplySchema