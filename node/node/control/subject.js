const Subject = require('../Models/subject')
const User = require('../Models/user')
const Good = require('../Models/good_diary')
const Comment = require('../Models/comment')

// 添加题目
exports.add = async ctx => {
  let data;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let bodyData = ctx.request.body;
    bodyData.from = ctx.session.uid;
    data = await new Subject(bodyData)
      .save()
      .then(res=>res);
  }
  ctx.body = data;
};

// 题目列表
exports.list = async ctx => {
  let uid = ctx.session.uid;
  let page = ctx.params.page;
  let id = ctx.params.id;
  let chapterId = ctx.params.chapterId;
  page--;
  let query = {chapterId,courseId:id};
  const data = await Subject
    .find(query)
    .sort('created')
    .skip(page*10)
    .limit(10)
    .populate('from','username') // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
    .populate('chapterId','chapter')
    .populate('courseId','course')
  const total = await Subject.find(query);
  ctx.body = {
    data,
    total:total.length,
  };
};

exports.delete = async ctx => {
  let data = 1;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let id = ctx.params.id;
    await Subject.deleteOne({_id:id}).exec();
  }

  ctx.body = data;
};
