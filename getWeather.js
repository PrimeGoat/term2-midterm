const axios = require('axios');
const moment = require('moment');

const owApiKey = "a86143ef460f0fc8a12b59a6ee48892f";
const zcApiKey = "MVEQXqLX9ueko5O28CNSKfMAdU8Jr63TCCMIdMe22ScA0w1lgAR6liADIaTn8pMz";
const defaultZipCode = "11235";

// Command to run when encountering "getWeather" intent
const command = async function(command, parameters, intent, socket) {
	let datetime = parameters.fields['date-time'].stringValue || moment().format();
	let type = parameters.fields['forecast-type'].stringValue || "daily";
	let zipcode = String(parameters.fields.zipcode.stringValue).replace(/[^0-9]/g, '');

	// Process zipcode
	if(isNaN(zipcode) || zipcode.length != 5) return "Invalid zip code."
	const zipUrl = `https://www.zipcodeapi.com/rest/${zcApiKey}/info.json/${zipcode}/degrees`;
	let lat, long, cityState;
	try {
		coords = await axios.get(zipUrl);
		lat = coords.data.lat;
		long = coords.data.lng;
		cityState = `${coords.data.city}, ${coords.data.state}`;
	} catch(err) {
		return "Invalid Zipcode";
	}

	if(lat == undefined || long == undefined) return "Cannot look up zipcode";

	// Obtain weather forecast
	const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&units=imperial&appid=${owApiKey}`;

	let result;
	try {
		result = await axios.get(url);
	} catch(err) {
		return "Couldn't look up the weather.";
	}

	result = result.data;
	console.log("Weather Forecast", command, moment(datetime).format('dddd, MMM D'), type);

	let content, checkDay;
	// The weather forecast - process based on user-specified type
	switch(type) {
		case "hourly":
			// Check to see if the target date is today
			checkDay = moment(datetime).format('YYYY DDD');
			let today = moment(moment.now()).format('YYYY DDD');
			let startHour;
			if(checkDay == today) {
				startHour = moment(moment.now()).format('YYYY DDD H');
			} else {
				startHour = moment(datetime).startOf('day').format('YYYY DDD H');
			}
			let hours = [], moreHours = 0, currentWeather = "", currentDay = "";
			for(hour of result.hourly) {
				let currentHour = moment.unix(hour.dt);
				if(startHour == currentHour.format('YYYY DDD H')) moreHours = 10;
				if(moreHours-- > 0) {
					let weather = hour.weather[0].description;
					if(weather != currentWeather) {
						currentWeather = weather;
					} else {
						weather = "";
					}
					let day = currentHour.format('dddd, MMM D ');
					if(day != currentDay) {
						currentDay = day;
					} else {
						day = "";
					}
					console.log("Hour's weather: ", weather);
					hours.push(`${day}${currentHour.format('ha')}: ${weather} ${Math.round(hour.temp)} degrees`);
				}
			}
			content = `Hourly forecast: \n` + hours.join(",\n");
			break;
		case "daily":
			//console.log("Result", result);
			console.log("checkday", moment(datetime).format('YYYY DDD'));
			let day = getDay(datetime, result);

			content = `Daily forecast for ${moment(datetime).format('dddd, MMM D')}: ${day.weather[0].description} with a high of ${Math.round(day.temp.max)} and a low of ${Math.round(day.temp.min)}`;
			break;
		case "weekly": case "7day":
			checkDay = moment(datetime).format('YYYY DDD');
			let week = [], moreDays = 0, days = getDay(datetime, result, 7);

			for(let i = 0; i < days.length; i++) {
				let date = moment.unix(days[i].dt);
				week.push(`${(i == 0) ? date.format('dddd, MMM D') : date.format('dddd')}: ${days[i].weather[0].description} with a high of ${Math.round(days[i].temp.max)} and a low of ${Math.round(days[i].temp.min)}`);
			}
			content = `Weekly forecast: \n` + week.join(".\n");
			content = "Your weekly forecast is available in the output area.";
			break;
	}

	if(content == "" || content == undefined) content = "No weather forecast available.";

	let html = displayForecast(datetime, cityState, type, result);
	//let html = content.replace(/\n/g, '<br>');
	socket.emit("content", html);
	// "The Weather forecast: " + moment.unix(result.data.daily[0].dt).format('dddd, MMM D')

	return content; // "Your weather forecast is available in the output area.";
}

// Generates HTML version of forecast
const displayForecast = function(timestamp, cityState, type, result) {
	let output = '';

	switch(type) {
		case 'hourly':
			break;
		case 'daily':
			let day = getDay(timestamp, result);
			output += `<center><div class="dayWeather"><b>${cityState}</b><br>${moment(timestamp).format('dddd, MMM D')}<br>`;
			output += `<img src="${iconUrl(day.weather[0].icon)}" width="100px" height="100px"><br>`;
			output += `<span class="temperature">${Math.round(day.temp.day)}&deg;</span><br><span class="weatherDesc">${day.weather[0].description}`
			output += `</span><br>High: ${Math.round(day.temp.max)}<br>Low: ${Math.round(day.temp.min)}</div></center>`;
			break;
		case "weekly": case "7day":
			let days = getDay(timestamp, result, 7);
			output += `<div class="weekWeather"><p class="weekCity"><b>${cityState}</b></p>`
			for(let day of days) {
				output += `<div class="dayWeather">${moment.unix(day.dt).format('dddd, MMM D')}<br>`;
				output += `<img src="${iconUrl(day.weather[0].icon)}" width="100px" height="100px"><br>`;
				output += `<span class="temperature">${Math.round(day.temp.day)}&deg;</span><br><span class="weatherDesc">${day.weather[0].description}`
				output += `</span><br>High: ${Math.round(day.temp.max)}<br>Low: ${Math.round(day.temp.min)}</div>`;
			}
			output += `</div>`;
			break;
	}

	return output;
}

// Gets a specified day from a forecast
const getDay = function(date, result, consecutive = 1) {
	checkDay = moment(date).format('YYYY DDD');
	let days = [], moreDays = 0;

	for(day of result.daily) {
		if(checkDay == moment.unix(day.dt).format('YYYY DDD')) {
			if(consecutive == 1) return day;
			moreDays = consecutive;
		}
		if(moreDays-- > 0) days.push(day);
	}

	return days;
}

// Generates an icon URL based on weather icon name
const iconUrl = function(name) {
	return `https://openweathermap.org/img/wn/${name}@2x.png`
}

// Exports method
module.exports = {
	command: command
}
