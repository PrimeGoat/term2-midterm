const router = require('express').Router();

router.post('/register', (req, res, next) => {
    return res.render('register');
});

module.exports = router;
