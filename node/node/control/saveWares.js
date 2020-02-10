const Good = require('../Models/good_diary');
const Diary = require('../Models/diary')
const User = require('../Models/user')
const Save = require('../Models/saveWares')

// 添加收藏
exports.add = async ctx => {
  if(ctx.token.error == 0){
		const waresId = ctx.params.id;
		const uid = ctx.token.decode_token.id;
		await new Save({
		  ware: waresId,
		  author:uid,
		})
		  .save();
		const data = await Save
		  .findOne({ware: waresId,author:uid})
		  .populate({
		    path: 'ware',
		    select: '_id img_url title content type area money see recentlytime commentNum',
		    populate:{
		      path:'from',
		      select:'_id username avatar'
		    }
		  });
		ctx.body = {
			data,
			error: 0,
		}
	}else{
		ctx.body = {
			data: 0,
			error: 1,
		}
	}
};

// 是否收藏了这个商品
exports.issave = async ctx => {
  if(ctx.token.error == 0){
		const ware = ctx.params.id;
		const uid = ctx.token.decode_token.id;
		const data = await Save.find({author:uid,ware}).exec();
		ctx.body = {
			data,
			error: 0
		}
	}else{
		ctx.body = {
			data:0,
			error: 1
		}
	}
};

// 取消收藏
exports.reduce = async ctx => {
  if(ctx.token.error == 0){
  	const ware = ctx.params.id;
  	const uid = ctx.token.decode_token.id;
  	const data = await Save.deleteOne({author:uid,ware}).exec();
  	ctx.body = {
  		data,
  		error: 0
  	}
  }else{
  	ctx.body = {
			data: 0,
			error: 1
		}
  }
};

// 我的收藏列表
exports.list = async ctx => {
  if(ctx.token.error == 0){
		const uid = ctx.token.decode_token.id;
		const data = await Save
			.find({author:uid})	
			.populate('author','username')
			.populate({
					path: 'ware',
					select: '_id',
					populate:{		 
					path:'from',
					select:'_id',
				},
			});
		ctx.body = {
			data,
			error: 0
		}
	}else{
		ctx.body = {
			data: 0,
			error: 1
		}
	}
};