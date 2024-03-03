const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validatePasswordChange } = require('../utils/validation');

const router = express.Router();

// GET /profile
router.get('/', (req, res) => {
    res.render('profile'); // Предполагается, что информация о пользователе доступна через объект req.user
});

// POST /profile/delete
router.post('/delete', async (req, res) => {
    try {
        // Удаление пользователя из базы данных
        const decodedToken = jwt.decode(req.cookies.token);
        id = decodedToken.userId;
        await User.findOneAndDelete({ _id: id });
        
        // Clear the token cookie
        res.clearCookie('token');
        
        // Редирект на страницу регистрации или другую страницу вашего выбора после удаления аккаунта
        res.redirect('/logout');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user account');
    }
});

// POST /profile/password
router.post('/pass', async (req, res) => {
    const { password, password2,password3 } = req.body;
    const decodedToken = jwt.decode(req.cookies.token);
    const id = decodedToken.userId;
    // Validation
    const validation = await validatePasswordChange(password, password2,password3,id);
    if (!validation.success) {
        
        return res.render('profile', { errorMessage: validation.message });

    }

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(password2, 10);
    try {
        
        // Обновление пароля пользователя
        const user = await User.findOneAndUpdate({ _id: id }, { password: hashedPassword }, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        return res.render('profile', { successMessage: 'You change password' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error changing password');
    }
});

module.exports = router;
