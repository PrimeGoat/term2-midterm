const mongoose = require('mongoose');
//const Bot = require('./Bot');


const UserSchema = new mongoose.Schema({
	name: {type: String, required: true, lowercase: false},
	email: {type: String, unique: true, required: true, lowercase: true},
	password: {type: String, required: true, min: 3},
	mustChange: {type: Boolean, required: true, default: true},
//	category: { type: Schema.Types.ObjectId, ref: 'Bot' },
});

module.exports = mongoose.model('User', UserSchema);
