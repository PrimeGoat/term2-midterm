const express = require('express');
const router = require('express').Router();
const morgan = require('morgan');
const port = process.env.PORT || 3000;
require('dotenv').config();
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const { userInfo } = require('os');
let MongoStore = require('connect-mongo')(session)
const bcrypt = require('bcryptjs');
const { nanoid } = require("nanoid");
//const { x } = require("./myModule");
const User = require('../models/User');
const Bot = require('../models/User');
require('../lib/passport');
const mailjet = require ('node-mailjet')
.connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);


// POST /register
// GET /userinfo
// PUT /updateuser
// DELETE /deleteuser
// POST /login
// PUT /updatepassword

const auth = (req, res, next) => {
	if(req.isAuthenticated()) {
		next();
	} else {
		return res.render('mustlogin');
	}
}

router.post('/register', (req, res) => {
	User.findOne({ email: req.body.email }).then(user => {
		if(user) {
			req.flash('errors', 'Account exists');
			return res.redirect(301, '/register');
			//res.status(400).json({ message: 'User exists' });
		} else {
			const newUser = new User();
			const salt = bcrypt.genSaltSync(10);
			let password = nanoid();
			console.log('Password:', password);
			const hash = bcrypt.hashSync(password, salt);

			newUser.name = req.body.name;
			newUser.email = req.body.email;
			newUser.password = hash;
			newUser.mustChange = true;

			newUser.save().then(user => {
				mailjet
				.post("send", {'version': 'v3.1'})
				.request({
					"Messages":[{
						"From": {
							"Email": "denis.savgir@codeimmersives.com",
							"Name": "Nova Chatbot"
						},
						"To": [{
							"Email": newUser.email,
							"Name": newUser.name
						}],
						"Subject": "Your temporary password",
						"TextPart": "Welcome to Nova Chatbot.  Please log in with your temporary password and then update it to something more secure!  Your password is: " + password + "\nChange your password here: http://denis-midterm.herokuapp.com/changepassword",
						"HTMLPart": "Welcome to KILLSITE.  Please log in with your temporary password and then update it to something more secure!  Your password is: <b>" + password + "</b><br>Change your password here: <a href=http://denis-midterm.herokuapp.com/changepassword>http://denis-midterm.herokuapp.com/changepassword</a>"
					}]
				});
				return res.redirect('/thankyou');
			}).catch(err => console.log('Error: ', err));
		}
	});
});

router.get('/userinfo', auth, (req, res, next) => {
    return res.render('userinfo');
});

router.put('/updateuser', auth, (req, res, next) => {
    return res.render('userinfo');
});

router.delete('/deleteuser', auth, (req, res, next) => {
    return res.render('deleteuser');
});

const loginCheck = [
	check('email').isEmail(),
	check('password').isLength({min: 3})
];

const loginValidate = (req, res, next) => {
	const info = validationResult(req);
	console.log("INFO: ", info);
	if(!info.isEmpty()) {
		console.log("Invalid");
		req.flash('errors', 'Invalid email or password');
		return res.redirect('/login');
	}
	User.findOne({ email: req.body.email })
	.then(user => {
		if(user) {
			if(user.mustChange) {
				console.log(user.email + " Still needs to change their initial password.");
				req.flash('errors', 'You tried to log in but you must change your password first.');
				return res.redirect('updatepassword');
			}
		}
	});

	next();
};

router.post('/login', loginCheck, /*loginValidate,*/ passport.authenticate('local-login', {
	successRedirect: '/bot',
	failureRedirect: '/login',
	failureFlash: true
}));

router.put('/updatepassword', (req, res, next) => {
    return res.render('updatepassword');
});

module.exports = router;
