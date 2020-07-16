const axios = require('axios');
const moment = require('moment');

const owApiKey = "a86143ef460f0fc8a12b59a6ee48892f";
const zcApiKey = "MVEQXqLX9ueko5O28CNSKfMAdU8Jr63TCCMIdMe22ScA0w1lgAR6liADIaTn8pMz";
const defaultZipCode = "11235";


const command = async function(command, parameters, intent) {
	let datetime = parameters.fields['date-time'].stringValue;
	let type = parameters.fields['forecast-type'].stringValue;

	const zipcode = defaultZipCode;
	const zipUrl = `https://www.zipcodeapi.com/rest/${zcApiKey}/info.json/${zipcode}/degrees`;
	const coords = await axios.get(zipUrl);
	const lat = coords.data.lat;
	const long = coords.data.lng;
	const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&appid=${owApiKey}`;

	const result = await axios.get(url);

	console.log(JSON.stringify(result.data));
	console.log("Weather Forecast", command, moment(datetime).format('dddd, MMM D'), type);

	console.log("Day:", moment.unix(result.data.daily[0].dt).format('dddd, MMM D'));
}



module.exports = {
	command: command
}
