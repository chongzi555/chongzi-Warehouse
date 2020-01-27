const { Schema } = require('./config')

// 用户集合的 schema
const UserSchema = new Schema({
  username: String, // 用户名
  password: String, // 密码
  sex: String,
  age: Number,
  shopNum: {
    type: Number,
    default: 0
  },
  role:{ // 权限
    type: Number,
    default: 1, // 默认1
  },
  avatar:{ // 头像
    type: String,
    default: 'http://localhost:3000/avatar/default.jpg'
  }
},{versionKey:false,timestamps:{
  createdAt:'created' // 每个用户都带有注册时的时间。
  }})

UserSchema.post('remove',doc => { // doc的那个实例数据.
  const Diary = require('../Models/diary')
  const User = require('../Models/user')

  const userId = doc._id;

  /*
  *   1、删除日记的所有，包括：评论、回复、点赞、评论点赞
  *   2、把自己干掉
  */
  Diary
    .find({from:userId})
    .then((data)=>{
      data.forEach((v)=>{
        v.remove();
      })
    })
  User.deleteOne({_id:userId}).exec();
});

module.exports = UserSchema
