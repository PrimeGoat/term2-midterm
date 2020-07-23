// Set up Socket IO for communicating with serverside bot functionality
const socket = io();

const outputYou = document.querySelector('.output-you');
const outputBot = document.querySelector('.output-bot');

// Configure speech recognition (CHROME)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Talk button
document.querySelector('button').addEventListener('click', () => {
	recognition.start();
});

// Beginning of user speaking
recognition.addEventListener('speechstart', () => {
	console.log('Speech has been detected.');
});

// SEND USER'S SPEECH TO BOT
recognition.addEventListener('result', (e) => {
	console.log('Result has been detected.');

	let last = e.results.length - 1;
	let text = e.results[last][0].transcript;

	outputYou.textContent = text;
	console.log('Confidence: ' + e.results[0][0].confidence);

	// Obtain username and use it as the DialogFlow session ID
	const userHolder = document.getElementById("userHolder");
	const userName = userHolder.getAttribute("data-username");
	console.log("Sending text to DialogFlow using Session ID of '" + userName + "' and text: " + text);

	socket.emit('chat message', userName, text);
});

// Detect end of speech
recognition.addEventListener('speechend', () => {
	recognition.stop();
});

// Error in speech recognition
recognition.addEventListener('error', (e) => {
	outputBot.textContent = 'Error: ' + e.error;
});

// Received text from bot
socket.on('bot reply', function(text) {
	if(text == '') text = '(No answer...)';
	outputBot.textContent = text;
});

// Received audio from bot
socket.on('bot audio', function(data) {
	playOutput(data);
});

// Recognized text from user's speech
socket.on('content', function(data) {
	document.getElementById('output').innerHTML = data;
});

// Play received text-to-speech audio
function playOutput(arrayBuffer){
	let audioContext = new AudioContext();
	let outputSource;
	try {
		if(arrayBuffer.byteLength > 0){
			console.log("Buffer bytelength: ", arrayBuffer.byteLength);
			audioContext.decodeAudioData(arrayBuffer, buffer => {
				audioContext.resume();
				outputSource = audioContext.createBufferSource();
				outputSource.connect(audioContext.destination);
				outputSource.buffer = buffer;
				outputSource.start(0);
			},
			(arguments) => {
				console.log(arguments);
			});
		}
	} catch(err) {
		console.log("playOutput error: ", err);
	}
}
