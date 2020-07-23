const router = require('express').Router();

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
		return res.render('mustlogin', {isAuthenticated: req.isAuthenticated()});
	}
}

router.post('/register', (req, res, next) => {
    return res.render('register', {isAuthenticated: req.isAuthenticated()});
});

router.get('/userinfo', auth, (req, res, next) => {
    return res.render('userinfo', {isAuthenticated: req.isAuthenticated()});
});

router.put('/updateuser', auth, (req, res, next) => {
    return res.render('userinfo', {isAuthenticated: req.isAuthenticated()});
});

router.delete('/deleteuser', auth, (req, res, next) => {
    return res.render('deleteuser', {isAuthenticated: req.isAuthenticated()});
});

router.post('/login', (req, res, next) => {
    return res.render('bot', {isAuthenticated: req.isAuthenticated()});
});

router.put('/updatepassword', (req, res, next) => {
    return res.render('updatepassword', {isAuthenticated: req.isAuthenticated()});
});

module.exports = router;
