const dialogflow = require('dialogflow');
//const uuid = require('uuid');
const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();


// Sends a string to DialogFlow to obtain intent
async function runSample(input, sessionId = 'tokendomelakalema') {
    // A unique identifier for the given session
	//  const sessionId = uuid.v4();
	const projectId = process.env.PROJECTID;

	const config = {
		credentials: {
			private_key: process.env.PRIVATE_KEY,
			client_email: process.env.CLIENT_EMAIL
		}
	};

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient(config);
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: input,
                // The language used by the client (en-US)
                languageCode: 'en-US',
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
	return result;
}

// Handle incoming speech from browser
const inputText = async function(text, socket, sessionId = 'tokendomelakalema') {
	let result = await runSample(text, sessionId);

	let output;
	if(result.allRequiredParamsPresent) {
		output = await parseCommand(result.action, result.parameters, result.intent, socket);
	}

	let response = (output != undefined) ? output : result.fulfillmentText;

	let audio = await textToAudioBuffer(response);  // Turn text into speech

	socket.emit('bot reply', response);
	socket.emit('bot audio', audio);
}

// Identifies recognized commands and calls their listed function
const parseCommand = async function(command, parameters, intent, socket) {
	for(entry of cmd) {
		if(command.toLowerCase() == entry.command.toLowerCase()) {
			try {
				retVal = await entry.callback(command, parameters, intent, socket);
			} catch(err) {
				console.error(`Bot Command "${command}" had error:`, err);
			}
			if(typeof(err) == "undefined" && typeof(retVal) != "undefined" && retVal != "") {
				return retVal;
			}
		}
	}
	return null;
}

// Bot command handler
const cmd = [];

const addCmd = function(command, callback) {
	cmd.push({
		command: command,
		callback: callback
	});
}

// Clears the output buffer
const clearOutput = function(command, parameters, intent, socket) {
	socket.emit("content", "");
}
addCmd("clearOutput", clearOutput);

// Text to speech
async function textToAudioBuffer(text) {
	requestTTS.input = { text: text }; // text or SSML
	// Performs the Text-to-Speech request
	const response = await ttsClient.synthesizeSpeech(requestTTS);
	return response[0].audioContent;
}

function setupTTS() {
	let encoding = 'LINEAR16';

	const config = {
		credentials: {
			private_key: process.env.PRIVATE_KEY,
			client_email: process.env.CLIENT_EMAIL
		}
	};

	// Creates a client
	ttsClient = new textToSpeech.TextToSpeechClient(config);

	// Construct the request
	requestTTS = {
		// Select the language and SSML Voice Gender (optional)
		voice: {
			languageCode: 'en-US', //https://www.rfc-editor.org/rfc/bcp/bcp47.txt
			ssmlGender: 'FEMALE',  //  'MALE|FEMALE|NEUTRAL'
			name: 'en-US-Wavenet-F' // That's the voice I chose.  There were many choices.  The WaveNet ones are the highest quality
		},
		// Select the type of audio encoding
		audioConfig: {
			audioEncoding: encoding, //'LINEAR16|MP3|AUDIO_ENCODING_UNSPECIFIED/OGG_OPUS'
		}
	};
}

setupTTS();

// Exports methods
module.exports = {
	inputText: inputText,
	addCmd: addCmd
};
