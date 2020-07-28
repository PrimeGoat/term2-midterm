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
//const Bot = require('../models/Bot');
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
						"TextPart": "Welcome to Nova Chatbot.  Please log in with your temporary password and then update it to something more secure!  Your password is: " + password + "\nChange your password here: http://denis-midterm.herokuapp.com/updatepassword",
						"HTMLPart": "Welcome to Nova Chatbot.  Please log in with your temporary password and then update it to something more secure!  Your password is: <b>" + password + "</b><br>Change your password here: <a href=http://denis-midterm.herokuapp.com/updatepassword>http://denis-midterm.herokuapp.com/updatepassword</a>"
					}]
				});
				return res.redirect('/thankyou');
			}).catch(err => console.log('Error: ', err));
		}
	});
});

// Can only use GET and POST
router.get('/deleteuser', auth, (req, res, next) => {
	let email = req.user.email;
	User.deleteOne({ email: req.user.email })
	.then(user => {
		console.log("User deleted:", email);
	})
	.catch(err => {
		console.log("Error deleting user:", err);
	})
	req.logout();
	req.flash("success", "User deleted.");
	return res.redirect('/');
});

const loginCheck = [
	check('email').isEmail(),
	check('password').isLength({min: 3})
];

router.get('/passcheck', (req, res, next) => {
/*const loginValidate = (req, res, next) => {
	const info = validationResult(req);
	console.log("INFO: ", info);
	if(!info.isEmpty()) {
		console.log("Invalid");
		req.flash('errors', 'Invalid email or password');
		return res.redirect('/login');
	}*/
	console.log("User logged in, checking password mustChange");
	if(req.user == undefined || req.user == "") {
		console.log("User login invalid");
		return;
	}
	User.findOne({ email: req.user.email })
	.then(user => {
		console.log("User found", user);
		if(user && user.mustChange) {
			console.log(user.email + " Still needs to change their initial password.");
			// Log the user out.  They can't log in until they update their password.
			req.logout();
			return res.redirect('/updatepassword');
		} else {
			console.log("BOT!!");
			return res.redirect('/bot');
		}
	})
	.catch(err => {
		console.log("Error:", err);
	});
});

router.post('/login', loginCheck, /*loginValidate,*/ passport.authenticate('local-login', {
	successRedirect: '/api/v1/passcheck',
	failureRedirect: '/login',
	failureFlash: true
}));

// Forms don't let me use PUT.  Had to change it to POST
router.post('/updatepassword', (req, res, next) => {
	console.log("Updating password..");
	console.log("Form's email:", req.body.email);
	console.log("Form's old password:", req.body.currentpass);
	console.log("Form's new password:", req.body.newpass);

	User.findOne({ email: req.body.email })
	.then(user => {
		console.log("User found", user);

		// Check if current password is correct
		if(!bcrypt.compareSync(req.body.currentpass, user.password)) {
			console.log("Incorrect password supplied.");
			req.flash("errors", "Invalid email or password.");
			return res.redirect("/updatepassword");
		} else if(bcrypt.compareSync(req.body.newpass, user.password)) {
			console.log("New password same as old password.");
			req.flash("errors", "You tried to update the password to the current password.");
		}

		// Check if new password is valid
		if(req.body.newpass.length < 3) {
			console.log("New password too short.");
			req.flash("errors", "Your password is too short.");
			return res.redirect("/updatepassword");
		}

		// Now we update the password
		user.password = bcrypt.hashSync(req.body.newpass, bcrypt.genSaltSync(10));
		user.mustChange = false;

		user.save()
		.then(user => {
			console.log("Saved user:", user);
		})
		.catch(err => {
			console.log("Error saving user:", err);
		});

		// Send them back to the login prompt
		if(req.isAuthenticated()) {
			req.flash("success", "Password changed.");
		} else {
			req.flash("success", "Password changed.  You can now log in.");
		}
		res.redirect("/login");
	})
	.catch(err => {
		console.log("Error:", err);
		return;
	});
});

// Update user info
router.post('/updateuser', auth, (req, res, next) => {
	console.log("Updating User info..");
	console.log("Form's name:", req.body.name);
	console.log("Form's email:", req.body.email);
	console.log("Form's old password:", req.body.currentpass);
	console.log("Form's new password:", req.body.newpass);

	User.findOne({ email: req.user.email })
	.then(user => {
		console.log("User found", user);

		let successes = [];
		let errors = [];

		// Process name
		if(req.body.name != req.user.name) {
			if(req.body.name != "") {
				user.name = req.body.name;
				successes.push("Name updated.");
			} else errors.push("Name cannot be blank.");
		}

		// Process email
		if(req.body.email != req.user.email) {
			if(req.body.email != "" && req.body.email.match(/[^@]+@[^@.]+.[^.]+/)) {
				user.email = req.body.email;
				successes.push("Email updated.");
			}
			else errors.push("Must provide a valid email address");
		}

		// Check if current password is correct
		if(req.body.newpass != "") {
			if(!bcrypt.compareSync(req.body.currentpass, user.password)) {
				console.log("Incorrect password supplied.");
				errors.push("Incorrect password supplied.");
			} else if(bcrypt.compareSync(req.body.newpass, user.password)) {
				console.log("New password same as old password.");
				errors.push("You tried to update the password to the current password.");
			} else if(req.body.newpass.length < 3) { // Check if new password is valid
				console.log("New password too short.");
				errors.push("Your new password is too short.");
			} else {
				// Now we update the password
				user.password = bcrypt.hashSync(req.body.newpass, bcrypt.genSaltSync(10));
				successes.push("Password updated.");
			}
		}

		if(successes.length == 0) {
			successes.push("No changes made.");
		}

		req.flash("success", successes.join('\n'));
		req.flash("errors", errors.join('\n'));


		user.save()
		.then(user => {
			console.log("Saved user:", user);
		})
		.catch(err => {
			console.log("Error saving user:", err);
		});

		res.redirect("/api/v1/userinfo");
	})
	.catch(err => {
		console.log("Error:", err);
		return;
	});});

const populateUserInfo = ((req, res, next) => {
	if(typeof(req.user) != 'undefined' && req.user.email != "") {
		res.locals.name = req.user.name;
		res.locals.email = req.user.email;
	} else {
		res.locals.name = "None";
		res.locals.email = "Unknown";
	}
	next();
});

router.get('/userinfo', populateUserInfo, (req, res) => {
	res.render('user');
});


module.exports = router;
