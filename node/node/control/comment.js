const Comment = require('../Models/comment');
const Diary = require('../Models/diary')
const User = require('../Models/user')
const CommentGood = require('../Models/comment_good')

exports.diary_list = async ctx => { // 对应日记的评论
  let diary_id = ctx.params.id;
  const data = await Comment
    .find({diary:diary_id})
    .sort('-created')
    .populate('author','username avatar')
  ctx.body = data;
};

exports.add = async ctx => {
  let data;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let dataBody = ctx.request.body;
    dataBody.author = ctx.session.uid; // 评论的用户
    const save = await new Comment(dataBody).save();

    data = await Comment
      .findById(save._id)
      .populate('author','username avatar')
      .populate({
        path: 'diary',
        select: '_id',
        populate:{
          path:'from',
          select:'_id'
        }
      });
    if(data.diary.from._id != ctx.session.uid){
      await Diary.updateOne({_id:save.diary},{$inc:{commentNum:1,com_mes:1}})
      await User.updateOne({_id:data.diary.from._id},{$inc:{message:1}})
    }else{
      await Comment.updateOne({_id:save._id},{is_read:true});
      await Diary.updateOne({_id:save.diary},{$inc:{commentNum:1}})
    }

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
    query = {author:uid};
  }
  console.log(query)
  const data = await Comment
    .find(query)
    .sort('-created')
    .skip(page*10)
    .limit(10)
    .populate('author','username') // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
    .populate('diary','title');
  const total = await Comment.find(query)
  ctx.body = {
    data,
    total:total.length,
  };
};

exports.goodAdd = async ctx => {
  let data = 1;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let uid = ctx.session.uid;
    let dataBody = ctx.request.body;
    const commentId = ctx.request.body.comment;
    dataBody.author = uid;

    await new CommentGood(dataBody).save()
    await Comment.updateOne({_id:commentId},{$inc:{comment_goodNum:1}});
  }
  ctx.body = data;
};

exports.goodList = async ctx => {
  let uid = ctx.session.uid;
  let diary = ctx.params.id;
  const data = await CommentGood.find({author:uid,diary})
  ctx.body = data;
};

exports.goodDelete = async ctx => {
  let data = 1;
  if(!ctx.session.uid) {
    data = 0;
  }else{
    let uid = ctx.session.uid;
    let comment = ctx.params.id;
    await CommentGood.deleteOne({comment,author:uid});
    await Comment.updateOne({_id:comment},{$inc:{comment_goodNum:-1}});
  }
  ctx.body = data;
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
