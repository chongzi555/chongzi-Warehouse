const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const ChapterSchema = new Schema({
  chapter: String,
  from:{ // 权限
    type: ObjectId,
    ref: 'users', // 关联users集合
  },
},{versionKey:false,timestamps:{
    createdAt:'created' // 每个用户都带有注册时的时间。
  }});

ChapterSchema.post('remove',doc => { // doc的那个实例数据.
  const Audio = require('../Models/audio')
  const AudioChapter = require('../Models/audioChapter')

  const id = doc._id;
  /*
  *   1、删除日记的评论，回复，点赞，评论点赞
  *   2、减掉日记作者的日记数量
  *   3、通过comment和good的is_read判断作者是不是看过这条评论。没看过-> is_read变成false日记的评论消息-1，日记的作者的message -1
  *   4、删除该日记
  */
  Audio
    .find({chapterId: id})
    .then((data)=>{
      data.forEach((v)=>{
        v.remove();
      })
    });
  AudioChapter.deleteOne({_id:id}).exec();
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

module.exports = ChapterSchema
