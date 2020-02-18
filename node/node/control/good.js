
const Diary = require('../Models/diary')
const User = require('../Models/user')
const Good = require('../Models/good_ware')

exports.add = async ctx => {
  if(ctx.token.error == 0){
    let ware = ctx.request.body.ware;
    const uid = ctx.token.decode_token.id;
    await new Good({
      ware,
      author:uid,
    })
      .save();
    const data = await Good
      .findOne({ware,author:uid,})
      .populate('author','username')
      .populate({
        path: 'diary',
        select: '_id',
        populate:{
          path:'from',
          select:'_id avatar username'
        }
      });
    // if(data.ware.from._id != uid){
    //   await Diary.updateOne({_id:diary},{$inc:{good:1,good_mes:1}});
    //   await User.updateOne({_id:data.diary.from._id},{$inc:{message:1}})
    // }else{ // 与日记是同一个用户
    //   await Good.updateOne({_id:data._id},{is_read:true});
    //   await Diary.updateOne({_id:diary},{$inc:{good:1}})
    // }
    await Diary.updateOne({_id:ware},{$inc:{good:1,good_mes:1}});
    ctx.body = {
      error: 0,
      data
    }
  }else{
    ctx.body = {
      error: 1,
      data: 0
    }
  }
};

exports.isgood = async ctx => {
  let ware = ctx.params.id || 1;
  const uid = ctx.token.decode_token.id;
  let data = await Good.find({author:uid,ware});
  ctx.body = {
    error: 0,
    data
  };
};

exports.reduce = async ctx => { // 取消日记的点赞
  if(ctx.token.error == 0){
    let uid = ctx.token.decode_token.id;
    let ware = ctx.params.id;
    await Good
      .findOne({ware,author:uid})
      .populate({
        path:'ware',
        select:'_id',
        populate:{
          path:'from',
          select:'_id',
        }
      })
      .then(data=>data.remove());
    ctx.body = {
      error: 0,
      data: 1
    }
  }else{
    ctx.body = {
      error: 1,
      data: 0
    }
  }
};

exports.list = async ctx => {
  let diary = ctx.params.id;
  const data = await Good
    .find({diary})
    .populate('author','username');
  ctx.body = data;
};

exports.message = async ctx => {
  let diary = ctx.params.id;
  let data = [];
  const dataDir = await Diary.findById(diary)
  if(dataDir.from == ctx.session.uid){ // 这不是全等的。 点赞的用户是日记作者，不用加消息
    data = await Good
      .find({is_read:false,diary})
      .populate('author','username')
  }
  ctx.body = data;
};

exports.messageDel = async ctx => {
  let diary = ctx.params.id;
  let len = await Good
    .find({is_read:false,diary})
    .populate({
      path:'diary',
      populate:{
        path:'from',
        select:'_id',
      }
    })
  await Good.updateMany({diary},{is_read:true})
  await Diary.updateOne({_id:diary},{$inc:{com_mes:-len.length}})
  await User.updateOne({_id:len[0].diary.from._id},{$inc:{message:-len.length}})
  ctx.body = '';
};
