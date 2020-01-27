const Audio = require('../Models/audio')

// 添加音频
exports.add = async ctx => {
  let data;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let bodyData = ctx.request.body;
    bodyData.from = ctx.session.uid;
    data = await new Audio(bodyData)
      .save()
      .then(res=>res);
  }
  ctx.body = data;
};

// 音频列表
exports.list = async ctx => {
  let uid = ctx.session.uid;
  let page = ctx.params.page;
  let id = ctx.params.id;
  page--;
  let query = {chapterId:id};
  const data = await Audio
    .find(query)
    .sort('created')
    .skip(page*10)
    .limit(10)
    .populate('from','username') // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
    .populate('chapterId','chapter')
  const total = await Audio.find(query);
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
    await Audio.deleteOne({_id:id}).exec();
  }

  ctx.body = data;
};
