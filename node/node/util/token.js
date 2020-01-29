// jwt加密的使用：
const jwt = require('jsonwebtoken');

const serect = 'token';  //密钥，不能丢
exports.addtoken = (userInfo) => { //创建token并导出
  const token = jwt.sign({
		username: userInfo.username,
		id: userInfo._id,
		avatar: userInfo.avatar,
		sex: userInfo.sex,
		age: userInfo.age,
		mark: userInfo.mark,
		role: userInfo.role
	}, serect, {expiresIn: '5h'});
  return token;
};
exports.decodeToken = (data) => {
	var d = {};
	jwt.verify(data, serect, function(err, decoded) { // decoded:指的是tokneid解码后用户信息
		if(err){
			d.error = 1;
			console.log('token超时了')
		}else{
			d = decoded;
			d.error = 0;
		}
	})
	return d;
}