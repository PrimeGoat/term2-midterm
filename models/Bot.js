const mongoose = require('mongoose');
const User = require('./User');


const BotSchema = new mongoose.Schema({
	commands: {type: String, required: false, lowercase: false},
	//user: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Bot', UserSchema);
