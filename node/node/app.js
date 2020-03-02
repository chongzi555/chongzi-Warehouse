const Koa = require('koa')
const koaStatic = require('koa-static')
const router = require('./routers/router')
const body = require('koa-body')
const cors = require('@koa/cors'); // 跨域
const {join} = require('path')
const session = require('koa-session')
const socket = require('./util/online.js')

const app = new Koa

app.keys = ["帅虫是个大帅比"]
// session 的配置对象
const CONFIG = {
  key: "Sid",
  //maxAge: 36e5, // 默认时间一天
  overwrite: true,
  httpOnly: false,
  // signed: true,
  rolling: true
}

// 注册session
app.use(session(CONFIG, app))

/*
*       session是后台类似与前端的cookie。
*       session是后台才有的，不是前端的sessionStorage
*       可以通过session保持用户的登录状态。
* */

// 配置 koa-body 处理 post 请求数据。
app.use(body())

app.use(cors({
  credentials: true // 跨域请求设置cookie
})); // 跨域

// 配置静态资源目录
app.use(koaStatic(join(__dirname, 'public')))

// 注册路由信息
app.use(router.routes()).use(router.allowedMethods())




// koa下运用socket.io模块。
/*
  app.callback()
    返回一个可被 http.createServer() 接受的程序实例，也可以将这个返回函数挂载在一个 Connect/Express 应用中。
*/
let server = require('http').Server(app.callback()),
  io = require('socket.io')(server);
let count = 0;
io.sockets.on('connection',function(socket){ // 有用户连接了，启动服务
  socket.on('abcd',function(data){ // 用户发送了一个message的函数， data -> 前台传过来的数据
    count++;
    //socket.broadcast.emit('abc',data); // 接受到message过来的函数，然后返回一个push message的函数给除了发表message以外的其他连接了的用户。
    //socket.emit('abc',data); // 跟上面差不多，但只发给自己。


    io.sockets.emit('abc',count); // 前2个的结合 第二个参数，返回给前端的数据。
    socket.on('disconnect', function(){ // 关闭连接
      io.sockets.emit('abc',count);
      count--
    });
  });
});

server.listen(3000,()=>{
  console.log('3000端口启动中')
})

// 创建管理员用户。没有就自动
{
  const User = require('./Models/user')
  const crypto = require('./util/enctypt')
  User.find({username:'admin'})
    .then((data)=>{
      if(data.length===0){ // 不存在，就创一个。
        const _user = new User({
          username: 'admin',
          password: 'admin666',
          sex: 0, // 0女 1男
          age: '18',
          role:666,
          avatar: 'http://localhost:3000/avatar/default.jpg',
          mark: 0, // 分数
        })
        _user.save()
          .then(()=>{
            console.log("管理员用户名创建了 -> admin,  密码 -> admin666")
          })
          .catch(()=>{
            console.log("管理员账号检查失败")
          })
      }else{
        console.log("管理员用户名 -> admin,  密码 -> admin666")
      }
    })
}
