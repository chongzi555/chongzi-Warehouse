const multer = require('koa-multer') // 图片上传
const querystring = require('querystring');
const Diary = require('../Models/diary');
const Wares = require('../Models/wares');

// 头像上传
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload')
  },
  filename: function (req, file, cb) {
    var str = file.originalname.split('.');
    cb(null, Date.now()+'.'+str[1]);
  }
})
let upload = multer({ storage: storage });

const photo = async ctx => {
  let arr = [];
  for(let i in ctx.req.files){
    arr.push('http://localhost:3000/upload/' + ctx.req.files[i].filename);
  }
  const id = querystring.parse(ctx.querystring).id;
	let d = await Wares.findById(id).exec();
	if(d.img_url){
		data = JSON.parse(d.img_url).push(arr[0]);
		arr.unshift(JSON.parse(d.img_url)+'')
	}
  await new Promise((resolve, reject)=> {
    Wares.updateOne({_id: id}, {img_url: arr}, (err, res) => {
      if (err) throw err
      resolve(res);
    })
  })
  ctx.body = arr;
}

module.exports = {
  upload,
  photo,
}
// end