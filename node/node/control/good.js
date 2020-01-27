const Good = require('../Models/good_diary');
const Diary = require('../Models/diary')
const User = require('../Models/user')

exports.add = async ctx => {
  let data = 1;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let diary = ctx.request.body.diary;
    const uid = ctx.session.uid;
    await new Good({
      diary,
      author:uid,
    })
      .save();
    data = await Good
      .findOne({diary,author:uid,})
      .populate('author','username')
      .populate({
        path: 'diary',
        select: '_id',
        populate:{
          path:'from',
          select:'_id'
        }
      });
    if(data.diary.from._id != ctx.session.uid){
      await Diary.updateOne({_id:diary},{$inc:{good:1,good_mes:1}});
      await User.updateOne({_id:data.diary.from._id},{$inc:{message:1}})
    }else{ // 与日记是同一个用户
      await Good.updateOne({_id:data._id},{is_read:true});
      await Diary.updateOne({_id:diary},{$inc:{good:1}})
    }
  }
  ctx.body = data;
};

exports.isgood = async ctx => {
  let diary = ctx.params.id;
  console.log(diary)
  const uid = ctx.session.uid;
  let data = 0;
  await Good.find({author:uid,diary,})
    .then((res)=>{
      if(res.length){ // 有值
        data = 1;
      }
    });
  ctx.body = data;
};

exports.reduce = async ctx => { // 取消日记的点赞
  let data;
  if(!ctx.session.uid){
    data = 0;
  }else{
    data = ctx.session.uid;
    let diary = ctx.params.id;
    await Good
      .findOne({diary,author:data})
      .populate({
        path:'diary',
        select:'_id',
        populate:{
          path:'from',
          select:'_id',
        }
      })
      .then(data=>data.remove());
  }
  ctx.body = data;
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
