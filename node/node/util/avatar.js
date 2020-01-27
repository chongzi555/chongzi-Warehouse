const multer = require('koa-multer') // 图片上传
const querystring = require('querystring');
const User = require('../Models/user');
const {join} = require('path')

// 图片上传
const storage = multer.diskStorage({
  // 存储的位置
  destination: join(__dirname, "../public/avatar"),
  // 文件名
  filename(req, file, cb){
    const filename = file.originalname.split(".")
    cb(null, `${Date.now()}.${filename[filename.length - 1]}`)
  }
})

const upload = multer({storage})

const avatar = async ctx => {
  let id = ctx.params.id;
  let path = 'http://localhost:3000/avatar/' + ctx.req.file.filename;
  console.log(path)
  await User.updateOne({_id:id},{avatar:path});
  const data = await User.findById(id);
  ctx.body = data;
}

module.exports = {
  upload,
  avatar,
}
// end