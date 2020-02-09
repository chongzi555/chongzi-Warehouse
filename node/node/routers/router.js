const Router = require('koa-router')
const user = require('../control/user')

const chapter = require('../control/chapter');
const course = require('../control/course');
const subject = require('../control/subject')
const audioChapter = require('../control/audioChapter');
const parentingChapter = require('../control/parentingChapter');
const parentingSubject = require('../control/parentingSubject');
const audio = require('../control/audio');
const ranking = require('../control/ranking');
const wares = require('../control/wares');
const save = require('../control/saveWares');

const upload = require('../util/upload')
const avatar = require('../util/avatar')
const comment = require('../control/comment')
const reply = require('../control/reply')

const router = new Router

// 首页，用户是否还在登录时间。是，自动登录
router.get('/',user.keepLog,user.islogin);

// 注册用户 路由
router.post('/user/reg', user.reg);

// 登录
router.post('/user/login', user.login);

// 返回用户名路由
router.get('/username',user.keepLog,user.username);

// 注销
router.get('/user/logout',user.logout);

// 日记本
router.get('/user/book/:page',user.keepLog,user.book);

// 个人中心 -> 该用户是否有message
router.get('/user/message',user.keepLog,user.message);

// 用户列表
router.get('/user/list/:page',user.keepLog,user.list);
// 用户排行榜
router.get('/user/rankings/:page',user.keepLog,user.rankings);
// 修改用户信息
router.put('/user/changeUserInfo',user.keepLog,user.changeUserInfo);

// 个人中心 -> 用户删除
router.delete('/user/delete/:id',user.keepLog,user.delete);

// 发表商品；
router.post('/wares/add',user.keepLog,wares.add);
// 商品类型；
router.get('/wares/type/:type',user.keepLog,wares.type);
// 我的旧物；
router.get('/wares/mylist/:page',user.keepLog,wares.myList);
// 商品详情；
router.get('/wares/details/:id',user.keepLog,wares.details);

// 收藏商品；
router.post('/save/add/:id',user.keepLog,save.add);
// 是否收藏；
router.get('/save/is/:id',user.keepLog,save.issave);
// 删除收藏；
router.delete('/reduce/save/:id',user.keepLog,save.reduce);
// 我的收藏；
router.get('/save/my',user.keepLog,save.list);


// 增加章节；
router.post('/chapter/add',user.keepLog,chapter.add);
// 增加课程；
router.post('/course/add',user.keepLog,course.add);
// 增加题目；
router.post('/subject/add',user.keepLog,subject.add);
// 增加audio章节；
router.post('/audioChapter/add',user.keepLog,audioChapter.add);
// 增加音频；
router.post('/audio/add',user.keepLog,audio.add);
// 增加亲子竞技章节；
router.post('/parentingChapter/add',user.keepLog,parentingChapter.add);
// 增加亲子竞技列表；
router.post('/parentingSubject/add',user.keepLog,parentingSubject.add);
// 增加排位赛题目；
router.post('/ranking/add',user.keepLog,ranking.add);

// 章节列表
router.get('/chapter/list/:page',user.keepLog,chapter.list);
// 课程列表
router.get('/course/list/:page/:id',user.keepLog,course.list);
// 题目列表
router.get('/subject/list/:page/:id/:chapterId',user.keepLog,subject.list);
// 音频章节列表
router.get('/audioChapter/list/:page',user.keepLog,audioChapter.list);
// 章节下音频列表
router.get('/audio/list/:page/:id',user.keepLog,audio.list);
// 亲子章节列表
router.get('/parentingChapter/list/:page',user.keepLog,parentingChapter.list);
// 亲子章节下的题目
router.get('/parentingSubject/list/:page/:id',user.keepLog,parentingSubject.list);
// 排位赛题目
router.get('/ranking/list/:page/:id',user.keepLog,ranking.list);

// 章节 delete
router.delete('/chapter/delete/:id',user.keepLog,chapter.delete);
// 课程 delete
router.delete('/course/delete/:id',user.keepLog,course.delete);
// 题目 delete
router.delete('/subject/delete/:id',user.keepLog,subject.delete);
// 音频章节 delete
router.delete('/audioChapter/delete/:id',user.keepLog,audioChapter.delete);
// 音频列表 delete
router.delete('/audio/delete/:id',user.keepLog,audio.delete);
// 亲子章节 delete
router.delete('/parentingChapter/delete/:id',user.keepLog,parentingChapter.delete);
// 亲子章节下的题目 delete
router.delete('/parentingSubject/delete/:id',user.keepLog,parentingSubject.delete);
// 排位赛下的题目 delete
router.delete('/ranking/delete/:id',user.keepLog,ranking.delete);


// comment list
router.get('/comment/list/:page',user.keepLog,comment.list);

// comment 评论 message
router.get('/comment/message/:id',user.keepLog,comment.message);

// comment 评论 message
router.delete('/comment/message/:id',user.keepLog,comment.messageDel);

// comment_good add
router.post('/comment_good/add',user.keepLog,comment.goodAdd);

// comment_good add
router.delete('/comment_good/delete/:id',user.keepLog,comment.goodDelete);

// comment_good list
router.get('/comment_good/list/:id',user.keepLog,comment.goodList);

// comment delete
router.delete('/comment/delete/:id',user.keepLog,comment.delete);

// reply add
router.post('/reply/add',user.keepLog,reply.add);

// reply list
router.get('/reply/list/:id',user.keepLog,reply.list);

// reply other
router.post('/reply/other',user.keepLog,reply.other);



// 上传头像
router.post("/user/avatar/:id",user.keepLog,avatar.upload.single("file",20),avatar.avatar);

// 上传图片
router.post("/upload",user.keepLog,upload.upload.array("file",20),upload.photo);

module.exports = router
