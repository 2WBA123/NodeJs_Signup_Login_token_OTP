const express = require('express');
const router = express();

const userRoutes = require('./user.routes');

// User Routes
router.use('/user', userRoutes);

module.exports = router;
