const moment = require('moment');

const getAge = function(command, parameters, intent, socket) {
	const dob = moment("2020-07-15T16:20:00-04:00");
	console.log("GetAge has been called");
	return `I am ${readableSpan(moment().unix() - dob.unix())} old.`;
}

// Turns a span of seconds into a descriptive phrase
const readableSpan = function(seconds) {
	// buggy: 2342347823676342334
	seconds = Math.floor(seconds);

	let aeons = Math.floor(seconds / (60 * 60 * 24 * 365 * 1000000000));
	seconds -= aeons * (60 * 60 * 24 * 365 * 1000000000);

	let megaannums = Math.floor(seconds / (60 * 60 * 24 * 365 * 1000000));
	seconds -= megaannums * (60 * 60 * 24 * 365 * 1000000);

	let millenia = Math.floor(seconds / (60 * 60 * 24 * 365 * 1000));
	seconds -= millenia * (60 * 60 * 24 * 365 * 1000);

	let centuries = Math.floor(seconds / (60 * 60 * 24 * 365 * 100));
	seconds -= centuries * (60 * 60 * 24 * 365 * 100);

	let decades = Math.floor(seconds / (60 * 60 * 24 * 365 * 10));
	seconds -= decades * (60 * 60 * 24 * 365 * 10);

	let years = Math.floor(seconds / (60 * 60 * 24 * 365));
	seconds -= years * (60 * 60 * 24 * 365);

	let months = Math.floor(seconds / (60 * 60 * 24 * 30));
	seconds -= months * (60 * 60 * 24 * 30);

	let weeks = Math.floor(seconds / (60 * 60 * 24 * 7));
	seconds -= weeks * (60 * 60 * 24 * 7);

	let days = Math.floor(seconds / (60 * 60 * 24));
	seconds -= days * (60 * 60 * 24);

	let hours = Math.floor(seconds / (60 * 60));
	seconds -= hours * (60 * 60);

	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;

	let out = [];

	if(aeons)		out.push(`${aeons} ${pluralize(aeons, "aeon", "aeons")}`);
	if(megaannums)	out.push(`${megaannums} ${pluralize(megaannums, "megaannum", "megaannums")}`);
	if(millenia)	out.push(`${millenia} ${pluralize(millenia, "millenium", "millenia")}`);
	if(centuries)	out.push(`${centuries} ${pluralize(centuries, "century", "centuries")}`);
	if(decades)		out.push(`${decades} ${pluralize(decades, "decade", "decades")}`);
	if(years)		out.push(`${years} ${pluralize(years, "year", "years")}`);
	if(months)		out.push(`${months} ${pluralize(months, "month", "months")}`);
	if(weeks)		out.push(`${weeks} ${pluralize(weeks, "week", "weeks")}`);
	if(days)		out.push(`${days} ${pluralize(days, "day", "days")}`);
	if(hours)		out.push(`${hours} ${pluralize(hours, "hour", "hours")}`);
	if(minutes)		out.push(`${minutes} ${pluralize(minutes, "minute", "minutes")}`);
	if(seconds)		out.push(`${seconds} ${pluralize(seconds, "second", "seconds")}`);

	return out.join(", ");
}

// Pluralizer
const pluralize = function(amount, singular, plural) {
	if(amount == 1) return singular;
	else return plural;
}

const addMe = function(callback) {
	callback("getAge", getAge);
}

module.exports = {
	pluralize: pluralize,
	readableSpan: readableSpan,
	addMe: addMe
};
