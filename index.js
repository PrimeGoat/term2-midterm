const express = require('express');
const morgan = require('morgan');
const port = process.env.PORT || 5000;
require('dotenv').config();
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
let MongoStore = require('connect-mongo')(session)

// const User = require('./models/User');
// const Bot = require('./models/User');
// require('./lib/passport');

const app = express();
app.use(morgan('dev'));
app.use(cookieParser('process.env.SECRET'));
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET,
	store: new MongoStore({
		url: process.env.MONGODB_URI,
		mongooseConnection: mongoose.connection,
		autoReconnect: true
	}),
	cookie: {
		secure: false,
		maxAge: 1000 * 60 * 5
	}
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	console.log('Session: ', req.session);
	console.log('User: ', req.user);
	next();
});

mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})
.then(() => console.log('MongoDB connected'))
.catch(err=> console.log('MongoDB Error: ', err))


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // html
app.use(express.static(path.join(__dirname, 'public'))); // js, css, images
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Scopes variables into views
app.use((req, res, next) => {
	if(typeof(req.user) != 'undefined') res.locals.user = req.user.email;
	else res.locals.user = "None";
	//res.locals.user = "Test User";
	res.locals.isAuthenticated = req.isAuthenticated();
	//res.locals.isAuthenticated = true;
	res.locals.errors = req.flash('errors');
	res.locals.success = req.flash('success');
	next();
});


// Set up API router
const apiRouter = require('./routes/apiRouter');
app.use('/api/v1/', apiRouter);

const auth = (req, res, next) => {
	if(req.isAuthenticated()) {
		next();
	} else {
		return res.render('mustlogin');
	}
}

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/bot', auth, (req, res) => {
	res.render('bot');
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/thankyou', (req, res) => {
	res.render('thankyou');
});

app.get('/about', (req, res) => {
	res.render('about');
});

app.get('/about', (req, res) => {
	res.render('about');
});

app.get('/updatepassword', (req, res) => {
	return res.render('updatepassword');
});


app.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out.');
	return res.redirect('/');
});



// Main bot stuff below
const aibot = require('./aibot'); // Loads AI bot
const cors = require('cors');
const getWeather = require('./getWeather'); // Weather functionality
const misc = require('./misc'); // Misc functionality

//const app = express();

// Set up express web server
const server = app.listen(port, () => {
	console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
app.use(cors());


// Communicate with browser
const io = require('socket.io')(server);
io.on('connection', function(socket){
	console.log('a user connected');
});

io.on('connection', function(socket) {
	socket.on('chat message', (username, text) => {
		console.log('Username:', username);
		console.log('Message: ' + text);
		aibot.inputText(text, socket);
	});
});

// Add bot commands
aibot.addCmd("getWeather", getWeather.command);
misc.addMe(aibot.addCmd);
