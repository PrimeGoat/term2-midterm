const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: {type: String, required: true, lowercase: true},
	email: {type: String, unique: true, required: true, lowercase: true},
	password: {type: String, required: true, min: 3},
	mustChange: {type: Boolean, required: true, default: true},
});

module.exports = mongoose.model('User', UserSchema);
