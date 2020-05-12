const Diary = require('../Models/diary')
const User = require('../Models/user')
const Wares = require('../Models/wares');
const Comment = require('../Models/comment')

// 增加num字段；******
// Wares.updateMany({'num':{'$exists':false}},{'$set':{'num':1}}).then(res=>{
//   Wares.find().then(data=>{
//     console.log(data);
//   })
// })

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

// $gt 大于， $lt 小于
exports.type = async ctx => {
	let type = ctx.params.type;
	const data = await Wares
		.find({type,num:{$gt:0}})
		.sort('-created')
		.limit(20)
		.populate('from','username'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
	ctx.body = {
		data,
		error: 0
	};
};

exports.myList = async ctx => {
	if(ctx.token.error == 0){
		let page = ctx.params.page;
		let id = ctx.token.decode_token.id;
		page--;
		let query;
		if(ctx.session.username === 'admin'){
		  query = {};
		}else{
		  query = {from:id};
		}
		const data = await Wares
		  .find(query)
		  .sort('-created')
		  .skip(page*5)
		  .limit(5)
		  .populate('from','username avatar'); // 关联，那个字段，需要拿到什么数据，若要多个，则在username _id这样写。(有空格)
		const total = await Wares.find(query);
		ctx.body = {
		  data,
		  total:total.length,
			error: 0
		};
	}else{
		ctx.body = {
		  data: 0,
			error: 1
		};
	}
  
};

exports.details = async ctx => {
  let _id = ctx.params.id;
  const data = await Wares
    .findById(_id)
    .populate('from','username _id avatar');
  ctx.body = {
		data,
		error: 0
	};
};

exports.search = async ctx => {
  let input = new RegExp(ctx.params.input,'i'); // 模糊查询
  let page = ctx.params.page;
  page--;

  let d,t;
  d = await Wares
    .find({title: input})
    .sort('-created')
    .skip(page*10)
    .limit(10)
    .populate('from','username avatar');
  t = await Wares.find({title: input}) // 记录数量

  ctx.body = {
    error: 0,
    total: t,
    data: d,
  };
};

exports.success = async ctx => {
  if(ctx.token.error == 0){
    let id = ctx.request.body.id;
    await Wares.updateOne({_id:id},{$inc:{num:-1}}).exec();
    ctx.body = {
      error: 0,
      data:{}
    }
  }else{
    ctx.body = {
      error: 1,
      data: 0
    }
  }
}

exports.delete = async ctx => {
  if(ctx.token.error == 0){
    let id = ctx.request.body.id;
    await Wares.deleteOne({_id:id}).exec();
    ctx.body = {
      error: 0,
      data:{}
    }
  }else{
    ctx.body = {
      error: 1,
      data: 0
    }
  }
}