const { db } = require('../Schema/config');

const GoodDiarySchema = require('../Schema/good_diary');

const Good = db.model('goods', GoodDiarySchema);

module.exports = Good;