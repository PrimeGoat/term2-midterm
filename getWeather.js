const axios = require('axios');

const command = function(command, parameters, intent) {
	let datetime = parameters.fields['date-time'].stringValue;
	let type = parameters.fields['forecast-type'].stringValue;
	console.log("Weather Forecast", command, datetime, type, parameters, intent);
}



module.exports = {
	command: command
}
