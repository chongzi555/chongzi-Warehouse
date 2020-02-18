const { db } = require('../Schema/config');

const GoodWareSchema = require('../Schema/good_ware');

const Good = db.model('goods', GoodWareSchema);

module.exports = Good;