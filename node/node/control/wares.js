const Diary = require('../Models/diary')
const User = require('../Models/user')
const Wares = require('../Models/wares');
const Comment = require('../Models/comment')


exports.add = async ctx => {
  if(ctx.token.error == 0){
    let bodyData = ctx.request.body;
		let id = ctx.token.decode_token.id;
    bodyData.from = id;
    data = await new Wares(bodyData)
      .save()
      .then(res=>res);
    await User.updateOne({_id:id},{$inc:{shopNum:1}});
		ctx.body = {
			error: 0,
			data,
		};
  }else{
    ctx.body = {
    	error: 1,
    	data: 0,
    };
  }
};

exports.type = async ctx => {
	if(ctx.token.error == 0){
		let type = ctx.params.type;
		const data = await Wares
			.find({type})
			.sort('see')
			.limit(6)
			.populate('from','username'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
		ctx.body = {
			data,
			error: 0
		};
	}else{
		ctx.body = {
			data: 0,
			error: 1
		};
	}
	
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


exports.details = async ctx => {
  let _id = ctx.params.id;
  const data = await Diary
    .findById(_id)
    .populate('from','username _id avatar');
  ctx.body = data;
};
