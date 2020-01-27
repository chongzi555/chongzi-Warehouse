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
  const parentingChapter = require('../Models/parentingChapter')
  const parentingSubject = require('../Models/parentingSubject')

  const id = doc._id;

  parentingSubject
    .find({chapterId: id})
    .then((data)=>{
      data.forEach((v)=>{
        v.remove();
      })
    });
  parentingChapter.deleteOne({_id:id}).exec();
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
