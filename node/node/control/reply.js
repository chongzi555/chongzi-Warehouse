const Reply = require('../Models/reply')
const Comment = require('../Models/comment');

exports.add = async ctx => { // 回复评论，reply_id = 0;
  let data;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let uid = ctx.session.uid;
    let dataBody = ctx.request.body;
    dataBody.author = uid;
    const id = await new Reply(dataBody).save();
    data = await Reply
      .findById(id._id) // id._id回复的id
      .populate('author','username avatar')
      .populate({
        path:'comment',
        select: '_id',
        populate:{
          path:'author',
          select: 'username avatar',
        }
      })
    // 对应的评论 comment_replyNum +1;
    await Comment.updateOne({_id:id.comment},{$inc:{comment_replyNum:1}});
  }
  ctx.body = data;
};

exports.list = async ctx => {
  let diary = ctx.params.id;
  const data = await Reply
    .find({diary})
    .populate({ // 多重联表populate -> 爽    △△△
      path:'comment',
      select: '_id',
      populate:{
        path:'author',
        select: 'username avatar',
      }
    })
    .populate('author','username avatar')
    .populate('reply_id','username avatar');
  ctx.body = data;
};

exports.other = async ctx => {
  let data;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let uid = ctx.session.uid;
    let dataBody = ctx.request.body;
    console.log(dataBody)
    dataBody.author = uid;
    const id = await new Reply(dataBody).save();
    data = await Reply
      .findById(id._id) // id._id回复的id
      .populate('author','username avatar')
      .populate('comment','author')
      .populate('reply_id','username avatar');
  }
  ctx.body = data;
};