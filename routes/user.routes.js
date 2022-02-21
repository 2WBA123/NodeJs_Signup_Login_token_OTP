const express = require('express');
const router = express.Router();

const user = require('../controller/user.controller');

router.post('/signup', user.signUp);
router.post('/login', user.logIn);
router.post('/verifytoken', user.verifyToken);
router.post('/verifyotp', user.verifyOTP);
router.post('/regenerateotp', user.regenerateOtp);
module.exports = router;
