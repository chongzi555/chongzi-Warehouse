const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const DiarySchema = new Schema({
  title: String,
  content: String,
  from:{ // 权限
    type: ObjectId,
    ref: 'users', // 关联users集合
  },
  img_url: String,
  ispublic: Number, // 1就公开，0私密
  type: String,
  good: Number,
  weather: String,
  see: Number,
  commentNum: Number, // 评论个数
  com_mes: Number, // 评论消息个数
  good_mes: Number,
},{versionKey:false,timestamps:{
    createdAt:'created' // 每个用户都带有注册时的时间。
  }});

DiarySchema.post('remove',doc => { // doc的那个实例数据.
  const Comment = require('../Models/comment')
  const Diary = require('../Models/diary')
  const User = require('../Models/user')
  const Good = require('../Models/good_diary')

  const diaryId = doc._id;
  const userId = doc.from;
  let mes = doc.com_mes + doc.good_mes;
  /*
  *   1、删除日记的评论，回复，点赞，评论点赞
  *   2、减掉日记作者的日记数量
  *   3、通过comment和good的is_read判断作者是不是看过这条评论。没看过-> is_read变成false日记的评论消息-1，日记的作者的message -1
  *   4、删除该日记
  */
  Comment
    .find({diary:diaryId})
    .then((data)=>{
      data.forEach((v)=>{
        v.remove();
      })
    });
  Good
    .find({diary:diaryId})
    .then((data)=>{
      data.forEach((v)=>{
        v.remove();
      })
    });
  User.updateOne({_id:userId},{$inc:{diaryNum:-1,message:-mes}}).exec();
  Diary.deleteOne({_id:diaryId}).exec();
});

/*DiarySchema.statics.printCount = function () {
  console.log(this.device, '￥'+this.price);
  this.count({}, (err, count) => {
    console.log('---printCount()-----------------------------')
    if (err) {			console.log(err);
    } else {
      console.log('phone count=' + count);
    }
  });
};*/

module.exports = DiarySchema