const jwt = require('jsonwebtoken');
require('dotenv').config();


const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.username = decoded.username
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

const redirectToHomeIfLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Если токен недействителен или его не удалось верифицировать
                res.clearCookie('token');
                return res.redirect('/login');
            } else {
                // Токен верифицирован, перенаправляем на главную страницу
                return res.redirect('/');
            }
        });
    } else {
        // Если токен отсутствует, разрешаем продолжить запрос
        return next();
    }
};

const ifAdmin = (req, res, next) => {
    const token = req.cookies.token;


    jwt.verify(token,process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // If token is invalid, clear cookie and redirect to login
            res.clearCookie('token');
            return res.redirect('/login');
        } else {
            // Token is valid, check if user is an admin
            if (decoded.isAdmin) {
                // User is an admin, proceed to the next middleware
                return next();
            } else {
                // User is not an admin, unauthorized access
                return res.status(403).send('Unauthorized Access - Admin Only');
            }
        }
    });

};

module.exports = { verifyToken, redirectToHomeIfLoggedIn, ifAdmin };
