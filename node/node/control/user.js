const User = require('../Models/user')
const crypto = require('../util/enctypt')
const Token = require('../util/token')

// 注册中间件
exports.reg = async ctx => {
  let data = ctx.request.body;
  const username = data.username;
  const password = data.password;
  const sex = data.sex;
  const age = data.age;
  const isReg = await new Promise((resolve, reject)=>{
    User.find({username},(err,data)=>{ // 用户名是否存在。
      if(err)return reject(err);
      if(!data.length){ // 不存在,可注册
        const _user = new User({
          username,
          password: password,
          sex,
          age,
          message: 0,
        });
        _user.save((err,data)=>{
            if(err){
              reject(err)
            }else{
              resolve(data);
            }
        });
      }else{ // 存在；
        resolve('');
      }
    })
  })
    .then((res)=>{
      if(res){
        data.code = 1;
        return data; // 注册成功
      }else{
        return {
          code: 0,
        }; // 注册失败
      }
    })
    .catch(()=>{
      return -1; // 注册失败
    })
  ctx.body = isReg;
};

// 登录
exports.login = async ctx => {
  const data = ctx.request.body;
  const username = data.username;
  const password = data.password;
  const isLogin = await new Promise((resolve, reject)=>{
    User.find({username,password:password},(err,data)=>{
      if(err)return reject(err);
      if(data.length){ // 成功  设置后台session。前端cookie
        resolve(data)
      }else{ // 用户名或密码错误
        resolve(data)
      }
    })
  })
    .then(async data=>{ // 成功返回data，
      if(data.length!==0){
        ctx.cookies.set("username", new Buffer.from(username).toString('base64'), {
          domain: "localhost",
          path: "/",
          //maxAge: 36e5, // 默认时间一天
          httpOnly: true, // true 不让客户端能访问这个 cookie
          overwrite: true
        });
        // 用户在数据库的_id 值
        ctx.cookies.set("uid", data[0]._id, {
          domain: "localhost",
          path: "/",
          //maxAge: 36e5, // 默认时间一天
          httpOnly: true, // true 不让客户端能访问这个 cookie
          overwrite: true
        });
        ctx.session = {
          username,
          uid: data[0]._id,
          avatar: data[0].avatar,
          role: data[0].role
        };
        return data;
      }else{
        return data;
      }
    })
    .catch(err=>{ // 错误 -1
      return err;
    });
	let token = Token.addtoken(isLogin[0]);
  ctx.body = {
		isLogin,
		error: 0,
		token
	};
};

// 是否还在登录时间
exports.islogin = async ctx => {
  let cookieId = ctx.cookies.get('uid');
  let sessionId = ctx.session.uid;
  let data;
  if(cookieId === sessionId){
    data = await User.findById(sessionId);
  }else{
    ctx.cookies.set('username',null,{
      maxAge: 0,
    })
    ctx.cookies.set('uid',null,{
      maxAge: 0,
    })
    ctx.session = null;
  }
  ctx.body = data;
};

// 确定用户的状态  保持用户的状态
exports.keepLog = async (ctx,next) => {
  let token = ctx.request.header.authorization;
  let d = Token.decodeToken(token);
  if(d.error == 1){
  	ctx.token = {error:1};
  }else{
  	d.time_c = new Date();
  	token = Token.addtoken(d);
  	ctx.token = {
  		token,
  		decode_token: d,
  		error: d.error
  	};
  }
  await next(); // 如果下一个中间件有await的话，next()前就必须有await不然数据返回不到前端。前端报错。。。
};

// 注销
exports.logout = async ctx => {
  ctx.session = null;
  ctx.cookies.set('username',null,{
    maxAge: 0,
  })
  ctx.cookies.set('uid',null,{
    maxAge: 0,
  })
  ctx.body = '';
};

// userlist
exports.list = async ctx => {
  let page = ctx.params.page;
  page--;
  const data = await User
    .find({role: {"$lte":2}})
    .sort('-created')
    .skip(page*10)
    .limit(10)
  const total = await User.find({role: {"$lte":2}});
  ctx.body = {
    data,
    total:total.length,
  };
};

// 返回用户名
exports.username = async ctx => {
  ctx.body = {
    username: ctx.session.username,
    avatar: ctx.session.avatar,
    user_id: ctx.session.uid,
  }
};

exports.delete = async ctx => {
  let data = 1;
  if(!ctx.session.uid){
    data = 0;
  }
  let userId = ctx.params.id;
  await User
    .findById(userId)
    .then(data=>data.remove());
  ctx.body = data;
};

exports.book = async ctx => {
  let page = ctx.params.page;
  page--;
  const data = await User
    .find({role:1})
    .sort('-created')
    .skip(page*10)
    .limit(10);
  const total = await User.find({role:1})
  ctx.body = {
    data,
    total:total.length,
  };
};

// 用户排行
exports.rankings = async ctx => {
  let page = ctx.params.page;
  page--;
  const data = await User
    .find({role: {"$lte":2}})
    .sort('-mark')
    .skip(page*10)
    .limit(10)
  const total = await User.find({role: {"$lte":2}});
  ctx.body = {
    data,
    total:total.length,
  };
};

exports.changeUserInfo = async ctx => {
  let data = 1;
  if(!ctx.session.uid){
    data = 0;
  }else{
    let _id = ctx.request.body._id;
    console.log(ctx.request.body)
    User.updateOne({_id},{$set:ctx.request.body}).exec();
  }
  ctx.body = data;
};


exports.message = async ctx => {
  let data;
  let uid = ctx.session.uid;
  if(!uid){
    data = 0;
  }else{
    data = await User.findById(uid)
    data = data.message;
  }
  ctx.body = data;
};
