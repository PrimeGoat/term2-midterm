const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

passport.use('local-login',
	new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, (req, email, password, done) => {
		console.log("In local-login");
		User.findOne({email}, (err, user) => {
			if(err) {
				return done(err, null);
			}
			if(!user) {
				return done(null, false, req.flash('errors', "User not found"));
			}

			result = bcrypt.compareSync(password, user.password);
			if(!result) {
				return done(null, false, req.flash('errors', 'check email and password'));
			} else {
				return done(null, user);
			}
		});
	}

	)
);
