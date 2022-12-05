const {Schema, model, Types} = require('mongoose');

const schema = new Schema({
	data: {type: String, required: true },
	url: {type: String, required: true },
	date: {type: Date, default: Date.now},
	views: {type: Number, default: 0},
	owner: {type: Types.ObjectId, ref:'User'}
});

module.exports = model('Template', schema);
