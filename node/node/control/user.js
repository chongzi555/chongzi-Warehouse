const User = require('../Models/user')
const crypto = require('../util/enctypt')
const Token = require('../util/token')

const fs = require('fs');
const path = require('path');

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
	if(ctx.token.error == 0){
		let data = await User.findById(ctx.token.decode_token.id).exec();
		ctx.body = {
			error: ctx.token.error,
			data,
		};
	}else{
		ctx.body = {
			error: 1,
			data: 0
		}
	}
	
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

// 修改用户信息
exports.modifyUserInfo = async ctx => {
  let d = Token.decodeToken(ctx.request.header.authorization);
  let key = ctx.params.key;
  let val = ctx.params.val;
  let error = d.error;
  if(error == 0){
    if(key !== 'username'){ // 不是修改用户名
      let obj = {[key]:val};
      await User.updateOne({_id:d.id},{$set:{[key]:val}}).exec();
      const data = await User.findById(d.id).exec();
      var token = Token.addtoken(data);
      ctx.body = {
        data,
        error: error,
        token
      };
    }else{ // 修改用户名
      const data = await new Promise((resolve, reject)=>{
        User.find({username: ctx.params.val},async(err,data)=>{ // 用户名是否存在。
          if(err)return reject(err);
          if(!data.length){ // 不存在,可修改
            await User.updateOne({_id:d.id},{$set:{[key]:val}}).exec();
            const user = await User.findById(d.id).exec();
            resolve(user);
          }else{ // 用户名已存在
            resolve('用户名已存在,修改失败!');
          }
        });
      });
      var token = Token.addtoken(data);
      ctx.body = {
        data,
        error: error,
        token
      }
    }
  }else{
    
  }
};

// 修改密码
exports.changePassword = async ctx => {
  let body,data,old_pwd,new_pwd;
  if(ctx.token.error === 0){
    let id = ctx.token.decode_token.id;
    body = ctx.request.body;
    old_pwd = body.passwordOld;
    new_pwd = body.passwordNew;
    let yes = await User.find({_id:id,password: old_pwd});
    if(yes.length){ // 原密码密码是正确的，可以修改
      await User.updateOne({_id:id},{$set:{password:new_pwd}}).exec();
      data = 1;
    }else{ // 原密码错误
      data = 0;
    }
  }
  ctx.body = {
    error: ctx.token.error,
    data,
    token: ctx.token.token
  };
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


exports.chat = async ctx => {
  if(true){
    let id = ctx.params.id; // 聊天对象id
    let uid = 66667777; // 自己id
    var room = id + '-' + uid;
    var room2 = uid + '-' + id;

    var time = '2020-03-02';

    let u1 = path.join(process.cwd(),'public','content',`${room}.txt`);
    let u2 = path.join(process.cwd(),'public','content',`${room2}.txt`);
    console.log(u1)
    const data = await new Promise((resolve,reject)=>{
      if(fs.existsSync(u1)){
      fs.readFile(u1,"utf-8",(err,data)=>{
        data = data ? data : '';
        var sp = data.split(/20\d\d-\d\d-\d\d/)
          sp.shift();
          console.log(sp);

          var arr = [];
          sp.map(item=>{
            var i = item.indexOf(':');
            var key = item.slice(0,i);
            var value = item.slice(i+1);
            arr.push({[key]:value});
          });
          console.log(arr);
          resolve(arr);
        })
      }
      else if(fs.existsSync(u2)){
        fs.readFile(u2,"utf-8",(err,data)=>{
          console.log(data);

          data = data ? data : '';

           var sp = data.split(/20\d\d-\d\d-\d\d/)
            sp.shift();
            console.log(sp);

            var arr = [];
            sp.map(item=>{
              var i = item.indexOf(':');
              var key = item.slice(0,i);
              var value = item.slice(i+1);
              arr.push({[key]:value});
            });
            console.log(arr);
            resolve(arr);
        })
      }else{
        console.log('没聊过天？yeah！！');
        resolve([]);
      }
    })
    ctx.body = {
      error: 0,
      data,
    }
  }
  
}