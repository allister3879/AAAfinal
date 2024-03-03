const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const { verifyToken, redirectToHomeIfLoggedIn, ifAdmin } = require('./utils/auth'); 

const app = express();

// Connect to MongoDB Atlas using environment variable
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => console.error(err));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use((req, res, next) => { 
    res.locals.loggedIn = req.cookies.token ? true : false;
    if (req.cookies.token) {
        const decodedToken = jwt.decode(req.cookies.token);
        res.locals.username = decodedToken.username;
        res.locals.admin = decodedToken.isAdmin ? true : false;
    } else {
        res.locals.admin = false;
    }
    next();
});


app.use('/login', redirectToHomeIfLoggedIn, require('./routes/login'));
app.use('/register', redirectToHomeIfLoggedIn, require('./routes/register'));
app.use('/', verifyToken, require('./routes/index'));
app.use('/movie', verifyToken, require('./routes/movie'));
app.use('/logout', verifyToken, require('./routes/logout'));
app.use('/profile', verifyToken, require('./routes/profile'));
app.use('/admin', verifyToken, ifAdmin, require('./routes/admin'));

app.use((req, res, next) => {
    res.status(404).send('<center><h1>404 Not Found</h1></center>'); 
    next();
});

// Use the PORT environment variable to set the server port
app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
});
