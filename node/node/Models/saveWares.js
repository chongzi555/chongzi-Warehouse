const { db } = require('../Schema/config');

const SaveWaresSchema = require('../Schema/saveWares');

const Save = db.model('save', SaveWaresSchema);

module.exports = Save;