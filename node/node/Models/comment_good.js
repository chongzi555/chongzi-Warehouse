const { db } = require('../Schema/config');

const CommentGoodSchema = require('../Schema/comment_good');

const Comment_good = db.model('comment_goods', CommentGoodSchema);

module.exports = Comment_good;