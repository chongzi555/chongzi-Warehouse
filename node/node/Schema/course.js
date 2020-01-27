const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const ChapterSchema = new Schema({
  course: String,
  chapterId: {
    type: ObjectId,
    ref: 'chapters', // 关联users集合
  },
  lock: Boolean,
  from:{ // 权限
    type: ObjectId,
    ref: 'users', // 关联users集合
  },
},{versionKey:false,timestamps:{
    createdAt:'created' // 每个用户都带有注册时的时间。
  }});

ChapterSchema.post('remove',doc => { // doc的那个实例数据.
  const Subject = require('../Models/subject');
  const Course = require('../Models/course');

  const id = doc._id;
  //const userId = doc.from;
  /*
  *   1、删除该课程下的题目
  *   2、删除课程
  */
  Subject
    .find({courseId:id})
    .then((data)=>{
      data.forEach((v)=>{
        v.remove();
      })
    });
  Course.deleteOne({_id:id}).exec();
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
