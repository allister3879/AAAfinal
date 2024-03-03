const express = require('express');
const jwt = require('jsonwebtoken');
const {validateLogin}  = require('../utils/validation'); 
require('dotenv').config();


const router = express.Router();

router.get('/',(req, res) => {
    res.render('login');
});

// Login
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    // Validate login credentials
    const validation = await validateLogin(username, password);

    if (!validation.success) {
        return res.render('login', { errorMessage: validation.message });
    }

    const { user } = validation;

    // Create JWT token
    const payload = {
        userId: user._id,
        username: user.username,
        isAdmin: user.isAdmin
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store token in cookies
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/');
});

module.exports = router;
