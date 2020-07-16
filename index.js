'use strict';
require('dotenv').config();
const express = require('express');
const aibot = require('./aibot');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

const server = app.listen(process.env.PORT || 5000, () => {
	console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function(socket){
	console.log('a user connected');
});

// Web UI
app.get('/', (req, res) => {
	res.sendFile('index.html');
});

io.on('connection', function(socket) {
	socket.on('chat message', (text) => {
    console.log('Message: ' + text);

	aibot.inputText(text, socket);
	});
});
