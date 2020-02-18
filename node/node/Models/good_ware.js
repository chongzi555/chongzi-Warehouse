const { db } = require('../Schema/config');

const GoodWareSchema = require('../Schema/good_ware');

const Good = db.model('ware_goods', GoodWareSchema);

module.exports = Good;