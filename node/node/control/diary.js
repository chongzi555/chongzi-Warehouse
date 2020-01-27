const Goods = require('../Models/goods')
const User = require('../Models/user')
const Good = require('../Models/good_diary')
const Comment = require('../Models/comment')

exports.banner = async ctx => {
  const data = await Diary.find({banner:1})
  ctx.body = data;
};

exports.indexSee = async ctx =>{
  const data = await Diary
    .find({ispublic:1})
    .sort('-see')
    .limit(5)
  ctx.body = data;
};

exports.indexGood = async ctx =>{
  const data = await Diary
    .find({ispublic:1})
    .sort('-good')
    .limit(5)
  ctx.body = data;
};

exports.indexNew = async ctx =>{
  const data = await Diary
    .find({ispublic:1})
    .sort('-created')
    .limit(5)
  ctx.body = data;
};

exports.type = async ctx => {
  let type = ctx.params.type;
  let arr = ['深邃','开心','感伤','甜蜜','激励','苦涩','随感','分享','其他'];
  const data = await Diary
    .find({ispublic:1,type:arr[type]})
    .limit(8)
    .populate('from','username')
  ctx.body = data;
};

exports.add = async ctx => {
  let data
  if(!ctx.session.uid){
    data = 0;
  }else{
    let bodyData = ctx.request.body;
    bodyData.from = ctx.session.uid;
    data = await new Goods(bodyData)
      .save()
      .then(res=>res);
    await User.updateOne({_id:data.from},{$inc:{shopNum:1}});
  }
  ctx.body = data;
};

exports.list = async ctx => {
  let uid = ctx.session.uid;
  let page = ctx.params.page;
  page--;
  let query;
  if(ctx.session.username === 'admin'){
    query = {};
  }else{
    query = {from:uid};
  }
  const data = await Diary
    .find(query)
    .sort('-created')
    .skip(page*10)
    .limit(10)
    .populate('from','username'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
  const total = await Diary.find(query);
  ctx.body = {
    data,
    total:total.length,
  };
};

exports.my = async ctx => {
  let page = ctx.params.page;
  let id = ctx.params.id;
  let isAuthor = 1;
  let uid = ctx.session.uid;
  if(id !== '0' && ctx.session.uid != id){ // id存在，并且不是用户本人，不给操作删除
    isAuthor = 0
    uid = id;
  }
  page--;

  const data = await Diary
    .find({from:uid,ispublic:1})
    .sort('-created')
    .skip(page*10)
    .limit(10)
    .populate('from','username'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
  const total = await Diary.find({from:uid,ispublic:1})
  ctx.body = {
    data,
    total:total.length,
    isAuthor,
  };
};

exports.myrecently = async ctx => {
  let id = ctx.params.id;
  let uid = ctx.session.uid;
  if(id === '0'){
    id = uid;
  }
  const good = await Good
    .find({author:id})
    .sort('-created')
    .limit(5)
    .populate('diary','title')
  console.log(good)
  const comment = await Comment
    .find({author:id})
    .sort('-created')
    .limit(5)
    .populate('diary','title')
  ctx.body = {
    good,
    comment,
  }
};

exports.private = async ctx => {
  let page = ctx.params.page;
  page--;
  let uid = ctx.session.uid;
  const data = await Diary
    .find({from:uid,ispublic:0})
    .sort('-created')
    .skip(page*10)
    .limit(10)
    .populate('from','username'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
  //estimatedDocumentCount这玩意好像只能查集合的全部，不能区分。
  const total = await Diary.find({from:uid,ispublic:0})
  ctx.body = {
    data,
    total:total.length,
  };
};

exports.details = async ctx => {
  let _id = ctx.params.id;
  const data = await Diary
    .findById(_id)
    .populate('from','username _id avatar');
  ctx.body = data;
};

exports.see = async ctx => {
  let data = 1;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let _id = ctx.request.body._id;
    Diary.updateOne({_id},{$inc:{see:1}}).exec();
  }
  ctx.body = data;
};

exports.all = async ctx => {
  let page = ctx.params.page;
  page--;
  const data = await Diary
    .find({ispublic:1})
    .sort('-created')
    .skip(page*9)
    .limit(9)
    .populate('from','username'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
  const total = await Diary.find({ispublic:1});
  ctx.body = {
    data,
    total:total.length,
  };
};

exports.rankings = async ctx => {
  let page = ctx.params.page;
  page--;
  const data = await Diary
    .find({ispublic:1})
    .sort('-see')
    .skip(page*9)
    .limit(9)
    .populate('from','username'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
  const total = await Diary.find({ispublic:1});
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
    let diary = ctx.params.id;
    await Diary
      .findById(diary)
      .then(data=>data.remove())
  }

  ctx.body = data;
};

exports.search = async ctx => {
  let type = ctx.params.type;
  let input = new RegExp(ctx.params.input,'i'); // 模糊查询
  let page = ctx.params.page;
  page--;
  let arr = [];
  let total = 0; // 搜索到的总数。
  let data = [];
  switch (type){
    case 'title': // 搜索标题
      arr = [{ispublic:1,title:input}];
      break;
    case 'author': // 搜索作者
      let o = await User.find({username: input})
      o.forEach(item=>{
        arr.push({
          ispublic: 1,
          from: item._id,
        })
      })
      break;
    default: // 类型+标题搜索
      arr = [{ispublic:1,type:type,title:input}];
      break;
  }


  let d,t;
  await Promise.all(
    arr.map(async item=>{ // 搜索对应的日记
      d = await Diary
        .find(item)
        .sort('-created')
        .skip(page*9)
        .limit(9)
        .populate('from','username');
      d.length && data.push(...d);

      t = await Diary.find(item) // 记录数量
      total += t.length;
    })
  )


  ctx.body = {
    data,
    total,
  };
};