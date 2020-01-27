const RankingSubject = require('../Models/ranking')

// 添加题目
exports.add = async ctx => {
  let data;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let bodyData = ctx.request.body;
    bodyData.from = ctx.session.uid;
    data = await new RankingSubject(bodyData)
      .save()
      .then(res=>res);
  }
  ctx.body = data;
};

// 题目列表
exports.list = async ctx => {
  let uid = ctx.session.uid;
  let page = ctx.params.page;
  page--;
  let query = {};
  const data = await RankingSubject
    .find(query)
    .sort('created')
    .skip(page*10)
    .limit(10)
    .populate('from','username') // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
  const total = await RankingSubject.find(query);
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
    await RankingSubject.deleteOne({_id:id}).exec();
  }

  ctx.body = data;
};
