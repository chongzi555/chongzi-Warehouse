const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const CommentGoodSchema = new Schema({
  author:{
    type: ObjectId,
    ref: 'users',
  },
  diary:{
    type:ObjectId,
    ref: 'diaries',
  },
  comment:{
    type:ObjectId,
    ref:'comments'
  }
},{versionKey:false,timestamps:{
    createdAt:'created'
  }});

module.exports = CommentGoodSchema;