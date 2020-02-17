const Comment = require('../Models/comment');
const Diary = require('../Models/diary')
const User = require('../Models/user')
const CommentGood = require('../Models/comment_good')
const Ware = require('../Models/wares')

exports.diary_list = async ctx => { // 对应日记的评论
  let diary_id = ctx.params.id;
  const data = await Comment
    .find({diary:diary_id})
    .sort('-created')
    .populate('author','username avatar')
  ctx.body = data;
};

exports.add = async ctx => {
  if(ctx.token.error == 0){
    let dataBody = ctx.request.body;
    dataBody.author = ctx.token.decode_token.id; // 评论的用户
    /*
      {
        authod: id,
        ware: id,
        comment_con: string,
      }
    */
    const save = await new Comment(dataBody).save();

    const data = await Comment
      .findById(save._id)
      .populate('author','username avatar')
      .populate({
        path: 'ware',
        select: '_id',
        populate:{
          path:'from',
          select:'_id'
        }
      });
    await Ware.updateOne({_id:save.ware},{$inc:{commentNum:1}});
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

exports.list = async ctx => {
  let page = ctx.params.page;
  let wareId = ctx.params.id;
  page--;
  const data = await Comment
    .find({ware: wareId})
    .sort('-created')
    .skip(page*10)
    .limit(10)
    .populate('author','username avatar') // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
    .populate('ware','title from type');
  const total = await Comment.find({ware: wareId})
  ctx.body = {
    data,
    total:total.length,
  };
};

// 添加评论点赞
exports.goodAdd = async ctx => {
  if(ctx.token.error == 0){
    let uid = ctx.token.decode_token.id;
    let dataBody = ctx.request.body;
    const commentId = ctx.request.body.comment;
    dataBody.author = uid;

    const data = await new CommentGood(dataBody).save();
    await Comment.updateOne({_id:commentId},{$inc:{comment_goodNum:1}});
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

// 评论点赞列表
exports.goodList = async ctx => {
  let uid = ctx.token.decode_token.id;
  let wareId = ctx.params.id;
  const data = await CommentGood.find({author:uid,ware:wareId})
  ctx.body = {
    error: 0,
    data
  }
};

// 评论点赞删除
exports.goodDelete = async ctx => {
  if(ctx.token.error == 0){
    let uid = ctx.token.decode_token.id;
    let comment = ctx.params.id;
    await CommentGood.deleteOne({comment,author:uid});
    await Comment.updateOne({_id:comment},{$inc:{comment_goodNum:-1}});
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

exports.delete = async ctx => {
  let data = 1;
  if(!ctx.session.uid){
    data=0;
  }else{
    let comment = ctx.params.id;
    await Comment
      .findById(comment)
      .populate({
        path: 'diary',
        select: '_id',
        populate: {
          path: 'from',
          select: '_id',
        }
      })
      .then(data=>data.remove());
  }
  ctx.body = data;
};

exports.message = async ctx => {
  let diary = ctx.params.id;
  let data = [];
  const dataDir = await Diary.findById(diary);
  if(dataDir.from == ctx.session.uid){
    data = await Comment
      .find({is_read:false,diary})
      .populate('author','username avatar')
  }
  ctx.body = data;
};

exports.messageDel = async ctx => {
  let diary = ctx.params.id;
  let len = await Comment
    .find({is_read:false,diary})
    .populate({
      path:'diary',
      populate:{
        path:'from',
        select:'_id',
      }
    })
  await Comment.updateMany({diary},{is_read:true})
  await Diary.updateOne({_id:diary},{$inc:{com_mes:-len.length}})
  await User.updateOne({_id:len[0].diary.from._id},{$inc:{message:-len.length}})
  ctx.body = '';
};
