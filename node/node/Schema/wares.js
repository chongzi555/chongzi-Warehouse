const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId; // 这个是发表用户的id

// 用户集合的 schema
const GoodsSchema = new Schema({
  title: String,
  content: String,
  from:{
    type: ObjectId,
    ref: 'users', // 关联users集合
  },
  img_url: Array, // 图片
  type: String, // 类型
  area: String, // 地区
	money: String, // 钱
  see: Number, // 查看次数
  recentlytime: String, // 最近一次时间
  commentNum: Number, // 评论个数
},{versionKey:false,timestamps:{
    createdAt:'created' // 每个用户都带有注册时的时间。
  }});

module.exports = GoodsSchema