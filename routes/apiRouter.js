const router = require('express').Router();

router.get('/register', (req, res, next) => {
    return res.render('register');
});
