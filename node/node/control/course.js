const Course = require('../Models/course')
const User = require('../Models/user')
const Good = require('../Models/good_diary')
const Comment = require('../Models/comment')

// 添加章节
exports.add = async ctx => {
  let data;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let bodyData = ctx.request.body;
    bodyData.from = ctx.session.uid;
    data = await new Course(bodyData)
      .save()
      .then(res=>res);
  }
  ctx.body = data;
};

exports.list = async ctx => {
  let uid = ctx.session.uid;
  let page = ctx.params.page;
  let id = ctx.params.id;
  page--;
  let query = {chapterId: id};
  const data = await Course
    .find(query)
    .sort('created')
    .skip(page*10)
    .limit(10)
    .populate('from','username') // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
    .populate('chapterId','chapter')
  const total = await Course.find(query);
  ctx.body = {
    data,
    total:total.length,
  };
};

exports.details = async ctx => {
  let _id = ctx.params.id;
  const data = await Course
    .findById(_id)
    .populate('from','username _id avatar');
  ctx.body = data;
};

exports.all = async ctx => {
  let page = ctx.params.page;
  page--;
  const data = await Course
    .find({ispublic:1})
    .sort('-created')
    .skip(page*9)
    .limit(9)
    .populate('from','username'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
  const total = await Course.find({ispublic:1});
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
    await Course
      .findById(id)
      .then(data=>data.remove())
  }

  ctx.body = data;
};
