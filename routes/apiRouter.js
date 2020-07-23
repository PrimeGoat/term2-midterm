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
		return res.render('mustlogin');
	}
}

router.post('/register', (req, res, next) => {
    return res.render('register');
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

router.post('/login', (req, res, next) => {
    return res.render('bot');
});

router.put('/updatepassword', (req, res, next) => {
    return res.render('updatepassword');
});

module.exports = router;
