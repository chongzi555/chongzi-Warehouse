const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const CommentSchema = new Schema({
  author:{
    type: ObjectId,
    ref: 'users',
  },
  diary:{
    type:ObjectId,
    ref: 'diaries',
  },
  is_read:{
    type:Boolean,
    default:false,
  },
  comment_goodNum: Number, // 评论点赞个数
  comment_con: String,
  comment_replyNum: Number, // 评论回复个数
},{versionKey:false,timestamps:{
    createdAt:'created'
  }})

CommentSchema.post('remove',doc => { // doc的那个实例数据.
  const Comment = require('../Models/comment')
  const Diary = require('../Models/diary')
  const User = require('../Models/user')
  const Reply = require('../Models/reply')
  const CommentGood = require('../Models/comment_good')

  const commentId = doc._id;
  const diaryId = doc.diary._id;
  const userId = doc.diary.from._id;
  /*
  *   1、删除有关的回复
  *   2、对应日记的评论数 -1
  *   3、删掉评论有关的点赞
  *   4、通过comment的is_read判断作者是不是看过这条评论。没看过-> is_read变成false日记的评论消息-1，日记的作者的message -1
  *   5、删除自己
  */
  Reply.deleteMany({comment:commentId}).exec(); // 1
  Diary.updateOne({_id:diaryId},{$inc:{commentNum:-1}}).exec(); // 2
  CommentGood.deleteMany({comment:commentId}).exec(); // 3
  if(!doc.is_read){ // is_read为false   用户没看过。   减掉。
    Diary.updateOne({_id:diaryId},{$inc:{com_mes:-1}}).exec(); // 4
    User.updateOne({_id:userId},{$inc:{message:-1}}).exec(); // 4
  }
  Comment.deleteOne({_id:commentId}).exec(); // 5
});

module.exports = CommentSchema