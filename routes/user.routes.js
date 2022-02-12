const express = require('express');
const router = express.Router();

const user = require('../controller/user.controller');

router.post('/signup', user.signUp);
router.post('/login', user.logIn);

module.exports = router;
