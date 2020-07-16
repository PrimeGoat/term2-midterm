const dialogflow = require('dialogflow');
const uuid = require('uuid');
const textToSpeech = require('@google-cloud/text-to-speech');
const getWeather = require('./getWeather');

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(input, projectId = 'development-283417') {
    // A unique identifier for the given session
    //  const sessionId = uuid.v4();
	const sessionId = "tokendomelakalema";

	const config = {
		credentials: {
			private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCq50OE4mq6zu8c\nzvZ8FD+hpa9lu+cLs2/cmCHJRuD+9ESVcvCZh5doqJ6Ji8GJpajJvBcjcfL0dGb6\nFtzzMPn9WdiNqDDHak+wCX72kiFXRbVUW/JFrkF1ymWR7yL2N8+Fk0I6bFrCNtCL\nqab11Oe9mmElsWf1sPXQEbwFRW9Gr9ktDzJTg6oHfohmuC82gcktiSgai6/yJa/B\nQM+GxIFo3BpvgxpY657PfRGNdok8AsBgt0B3mnHCwHH+uhkzSZUHwuS/pU73N/Ma\nSYpuqJkWToe1H2QxEq9MygpEkokLDoKobH1me5bMvCZXOenm408OFKoJrBkckp7n\nL+oxfzmXAgMBAAECggEAAvnNFDcI3v4cnGJN+/ZJwHGqJ1Ea3JGdPMoHtmRyU9nI\niNek09hEm7EkTYxcvcDgAHaEMHFmiaHFa55eYs15GrCiB/xSsGKUu0SlmynFldjv\nvtn5AWFT93b0xvsNNpDGH360yKWM/KXqsQ1RgGrx8GrRyNte5YlVUgd612gcJfSv\n+jspdClNvrH5WbDQkQTQ/QSKkq90FcievisDzhOL31y21WTpHrerPIGiMg9bxOAj\nLYjdTlTYYhLzufqoMn3Jed3K0kNGTbMd0hqbvGRuxHUfJs8611TO345ScElWbe4d\nhEvG/zQwe208YZ8omFGF8DWehP88NQvqp2cCBcfFyQKBgQDVRgcXJxLhEcwsEScY\nTkut/FJxMFmytVyPU3A8vvJD7Pp193MsFzaaH/omxWpUg+LjjOF+q4OiQQ5f5sfO\nUwqPEqpDCbR4K3IGiS8YH49adl3v6rDKYJR05qJSrWaE7oXBpeUcWdG1RGDlgyAd\nQf1bBG2jBMLQq+nn3DxQIWBv6QKBgQDNJDwCUmsTQbAbaaYUKRyu3TaFU3w+2qH0\nEVxABS4t3KnpaxkLNVL5AEgi18URakUHjkp9PQzPXJBaQ6BuSb1NWqvWNB6UMZ67\nVh5Ob2f9/TfD3kBX4EFI4549dxneHi+xjOuH/Ip2anh7CQu1krXoZC4juo66IFa3\nImY8H4XtfwKBgDOxlpRhDy1oj/F6ctxsVeGlECKJUqSDWx0OX10J91TJgufHA66D\nLePrrklpfl1f3kXDZwC5990DIcXS/UkgTaXiI0y+dHTQKwI0jCqvs6J8oEY/v3w+\nLp2rLVsW1ouP+PG4ETFu/+qM2WOoBcexsAQ4rY5e4A2OLdLaSfAuNt7JAoGAfCeh\n6gXXqB/pZa3bRfhb07kudiLA34mS2xRmsJhyCm+ypgKbdZ0gSnNRNUVBj/ixLpF/\no6x/REDRXM/xGM6oM1jdBxckKqydVOQaE355gc7vISwx5P1khai87JZYoYXDd8HC\nCttdMa3enRgsbggM8EkxY45VM3C/CrdXCKxLciECgYEAikf2NBPeJiuI+KGQZInU\nxbHceLKu0xPSfgxX1VeynQRtZD3vHpgRKAbPmp8Hc0iOeVG1nFHerAsi8eIF0mUC\nrM+f2LP3d517wZkSW8mD9z+xroUt+yjZn7sl6MtsdRJBDHQ5nyO58JxcTvobo6zx\nKJD0iIuG7f1zShERcrcKJuE=\n-----END PRIVATE KEY-----\n',
			client_email: 'dialogflow-xevnyp@development-283417.iam.gserviceaccount.com'
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

// Handle incoming speech
const inputText = async function(text, socket) {
	let result = await runSample(text);

	let output;
	if(result.allRequiredParamsPresent) {
		output = await parseCommand(result.action, result.parameters, result.intent, socket);
	}

	let response = output || result.fulfillmentText;

	let audio = await textToAudioBuffer(response);  // Turn text into speech

	socket.emit('bot reply', response);
	socket.emit('bot audio', audio);
}

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

addCmd("getWeather", getWeather.command);

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
			private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCq50OE4mq6zu8c\nzvZ8FD+hpa9lu+cLs2/cmCHJRuD+9ESVcvCZh5doqJ6Ji8GJpajJvBcjcfL0dGb6\nFtzzMPn9WdiNqDDHak+wCX72kiFXRbVUW/JFrkF1ymWR7yL2N8+Fk0I6bFrCNtCL\nqab11Oe9mmElsWf1sPXQEbwFRW9Gr9ktDzJTg6oHfohmuC82gcktiSgai6/yJa/B\nQM+GxIFo3BpvgxpY657PfRGNdok8AsBgt0B3mnHCwHH+uhkzSZUHwuS/pU73N/Ma\nSYpuqJkWToe1H2QxEq9MygpEkokLDoKobH1me5bMvCZXOenm408OFKoJrBkckp7n\nL+oxfzmXAgMBAAECggEAAvnNFDcI3v4cnGJN+/ZJwHGqJ1Ea3JGdPMoHtmRyU9nI\niNek09hEm7EkTYxcvcDgAHaEMHFmiaHFa55eYs15GrCiB/xSsGKUu0SlmynFldjv\nvtn5AWFT93b0xvsNNpDGH360yKWM/KXqsQ1RgGrx8GrRyNte5YlVUgd612gcJfSv\n+jspdClNvrH5WbDQkQTQ/QSKkq90FcievisDzhOL31y21WTpHrerPIGiMg9bxOAj\nLYjdTlTYYhLzufqoMn3Jed3K0kNGTbMd0hqbvGRuxHUfJs8611TO345ScElWbe4d\nhEvG/zQwe208YZ8omFGF8DWehP88NQvqp2cCBcfFyQKBgQDVRgcXJxLhEcwsEScY\nTkut/FJxMFmytVyPU3A8vvJD7Pp193MsFzaaH/omxWpUg+LjjOF+q4OiQQ5f5sfO\nUwqPEqpDCbR4K3IGiS8YH49adl3v6rDKYJR05qJSrWaE7oXBpeUcWdG1RGDlgyAd\nQf1bBG2jBMLQq+nn3DxQIWBv6QKBgQDNJDwCUmsTQbAbaaYUKRyu3TaFU3w+2qH0\nEVxABS4t3KnpaxkLNVL5AEgi18URakUHjkp9PQzPXJBaQ6BuSb1NWqvWNB6UMZ67\nVh5Ob2f9/TfD3kBX4EFI4549dxneHi+xjOuH/Ip2anh7CQu1krXoZC4juo66IFa3\nImY8H4XtfwKBgDOxlpRhDy1oj/F6ctxsVeGlECKJUqSDWx0OX10J91TJgufHA66D\nLePrrklpfl1f3kXDZwC5990DIcXS/UkgTaXiI0y+dHTQKwI0jCqvs6J8oEY/v3w+\nLp2rLVsW1ouP+PG4ETFu/+qM2WOoBcexsAQ4rY5e4A2OLdLaSfAuNt7JAoGAfCeh\n6gXXqB/pZa3bRfhb07kudiLA34mS2xRmsJhyCm+ypgKbdZ0gSnNRNUVBj/ixLpF/\no6x/REDRXM/xGM6oM1jdBxckKqydVOQaE355gc7vISwx5P1khai87JZYoYXDd8HC\nCttdMa3enRgsbggM8EkxY45VM3C/CrdXCKxLciECgYEAikf2NBPeJiuI+KGQZInU\nxbHceLKu0xPSfgxX1VeynQRtZD3vHpgRKAbPmp8Hc0iOeVG1nFHerAsi8eIF0mUC\nrM+f2LP3d517wZkSW8mD9z+xroUt+yjZn7sl6MtsdRJBDHQ5nyO58JxcTvobo6zx\nKJD0iIuG7f1zShERcrcKJuE=\n-----END PRIVATE KEY-----\n',
			client_email: 'dialogflow-xevnyp@development-283417.iam.gserviceaccount.com'
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
			name: 'en-US-Wavenet-F' // That's the voice I chose.  There were many choices, including English in an Indian accent
		},
		// Select the type of audio encoding
		audioConfig: {
			audioEncoding: encoding, //'LINEAR16|MP3|AUDIO_ENCODING_UNSPECIFIED/OGG_OPUS'
		}
	};
}

setupTTS();

module.exports = {
	inputText: inputText
};
