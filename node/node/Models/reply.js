const { db } = require('../Schema/config');

const ReplySchema = require('../Schema/reply');

const Reply = db.model('replies', ReplySchema);

module.exports = Reply;