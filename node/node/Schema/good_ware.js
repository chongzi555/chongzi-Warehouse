const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const GoodWareSchema = new Schema({
  author:{
    type: ObjectId,
    ref: 'users',
  },
  ware:{
    type:ObjectId,
    ref: 'wares',
  },
  is_read:{
    type:Boolean,
    default:false,
  }
},{versionKey:false,timestamps:{
    createdAt:'created'
  }});

GoodWareSchema.post('remove',doc => { // doc的那个实例数据.
  const Diary = require('../Models/diary')
  const User = require('../Models/user')
  const Good = require('../Models/good_diary')


  console.log(doc,123)
  const goodId = doc._id;
  const diaryId = doc.diary._id;
  const userId = doc.diary.from._id;
  /*
  *   1、对应日记的点赞 -1
  *   2、通过good的is_read判断作者是不是看过这条评论。没看过-> is_read变成false日记的点赞消息-1，日记的作者的message -1
  *   3、删除自己
  */
  Diary.updateOne({_id:diaryId},{$inc:{good:-1}}).exec();
  if(!doc.is_read){ // is_read为false   用户没看过。   减掉。
    Diary.updateOne({_id:diaryId},{$inc:{good_mes:-1}}).exec(); // 4
    User.updateOne({_id:userId},{$inc:{message:-1}}).exec(); // 4
  }
  Good.deleteOne({_id:goodId}).exec(()=>{

  });
});

module.exports = GoodWareSchema;