const WebSocket = require('ws');
const User = require('../Models/user');
const Ranking = require('../Models/ranking');

const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 8080 });

// 匹配列表
let arr = []; // 用户
let room = {}; // 房间信息
let CLIENTS = []; // 建立连接列表
let hasList = []; // 已有列表
let numRoom = 0; // 正在匹配的用户个数

wss.on('connection', async function connection(ws,req) {

  let url = req.url.slice(1).split("/"),
      id = url[0];
  arr.push(id);
  console.log(id);
  console.log("当前房间数：",numRoom);
  CLIENTS.push({
    ws,
    userId: id // 当前用户id
  });
  // if(arr.length >= 2){ // 如果用户有2个了，开房间

  //   let user1 = arr.pop();
  //   let user2 = arr.pop();

  //   numRoom++;
    

  //   let a = CLIENTS.pop();
  //   hasList.push(a); // 放到已存在列表
  //   hasList.push(CLIENTS.pop()); // 放到已存在列表
  // }

  // CLIENTS.map(async (item,index)=>{
      
  //     if(item.userId == user1){
  //       item.room = {
  //         id: [user1,user2].join("-"),
  //         data: 1
  //       };
  //       item.ws.send(JSON.stringify({
  //         room:item.room,
  //         type: 0
  //       }));
  //     }
  //     if(item.userId == user2){
  //       item.room = {
  //         id: [user1,user2].join("-"),
  //         data: 1
  //       };
  //       item.ws.send(JSON.stringify({
  //         room:item.room,
  //         type: 0
  //       }));
  //     }
  // })


  ws.on('message', function incoming(message) {
    console.log(message);
    let msg = JSON.parse(message);
    console.log('______________-----________________');

    let id2 = msg.message.id;

    var time = '2020-03-02';

    var room = msg.id + '-' + id2;

    let u1 = path.join(process.cwd(),'public','content',`${room}.txt`);
    if(fs.existsSync(u1)){
      fs.readFile(u1,"utf-8",(err,data)=>{

        data = data ? data : '';

        var con = data + time + msg.id + ':' + msg.message.msg;

        fs.writeFile(u1,con,'utf8',function(error){
          if(error){
            console.log(error);
            return false;
          }
          var sp = con.split(/20\d\d-\d\d-\d\d/)
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

        })
      })
      
    }else{
      fs.readFile(u1,"utf-8",(err,data)=>{
        console.log(data);

        data = data ? data : '';

        var con = data + time + msg.id + ':' + msg.message.msg;

        fs.writeFile(u1,con,'utf8',function(error){
          if(error){
            console.log(error);
            return false;
          }
          var sp = con.split(/20\d\d-\d\d-\d\d/)
          sp.shift();
          console.log(sp);
        })
      })
    }

    console.log(msg,222);
    if(msg.message.type == 1){
      CLIENTS.map(item=>{
        console.log(item.userId==id2);
        if(item.userId==id2 && item.ws.readyState === WebSocket.OPEN && item.userId != msg.id){
          item.ws.send(JSON.stringify({
            data: msg,
            type:1,
            id: msg.id
          }));
        }
      })
    }
    if(msg.message.type == 2){
      hasList.map(item=>{
        if(item.room.id==msg.room && item.ws.readyState === WebSocket.OPEN && item.userId == msg.id){
          console.log('正常结束');
          item.ws.send(JSON.stringify({
            data: {message:{type:2,data:'ok'}},
            type:2,
          }));
          hasList = hasList.filter(item=>{
            return item.userId != msg.id;
          });
          CLIENTS = CLIENTS.filter(item=>{
            // msg.userId是用户2的id     msg.id用户1的id
            return item.userId != msg.id;
          });
          arr = arr.filter(item=>{
            return item != msg.id;
          });
        }
      })
    }
    if(msg.message.type == 3){ // 有用户退出了。需要删除掉。并发送给另一个匹配成功的人，他的对手退出了等信息。
      hasList.map(item=>{
        if(item.room.id==msg.room && item.ws.readyState === WebSocket.OPEN && item.userId != msg.id){
          item.ws.send(JSON.stringify({
            data: {message:{type:3,data:'队友已离线'}},
            type:3,
          }));
          hasList = hasList.filter(item=>{
            return item.room.id != msg.room;
          });
          CLIENTS = CLIENTS.filter(item=>{
             // msg.userId是用户2的id     msg.id用户1的id
            return item.userId != msg.userId && item.userId != msg.id;
          });
          arr = arr.filter(item=>{
            return item.userId != msg.userId && item.userId != msg.id;
          });
        }
      })
    }
    if(msg.message.type == 4){ // 取消匹配
      CLIENTS.map(item=>{
        if(item.ws.readyState === WebSocket.OPEN && item.userId == msg.id){
          item.ws.send(JSON.stringify({
            data: true,
            type:4,
          }));  
          CLIENTS = CLIENTS.filter(item=>{
            return item.userId != msg.id;
          })
          arr = arr.filter(item=>{
            return item != msg.id;
          })
        }
      })
    }
    
  });

  // ws.send('something');
  ws.on('close',function (res) {
    console.log('有用户离开了！');
    console.log(res);
  })
});