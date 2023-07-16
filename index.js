const dotenv = require('dotenv').config();;
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./database/db');
const auth = require('./routes/AuthRoute');
const post = require('./routes/PostRoute');
const user = require('./routes/UserRoute');
const bookMark = require('./routes/BookMarkRoute');
const checkOrigin = require('./middleware/ApiAuth');
const passport = require('passport');
const cookieSession = require('cookie-session')
const passportSetup=require('./config/passport')


connectToMongo();

const port = 5000;

const app = express();

app.use(express.json());
app.use(cors());

// app.use(checkOrigin);
// app.use(passport.initialize())
// app.use(passport.session())

app.use(cookieSession({
  name: 'session',
  keys: ["snapia"],
  maxAge: 24 * 60 * 60 * 100, 
}))

app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/post', post);
app.use('/api/bookmark', bookMark);

app.listen(port, () => {
  console.log(`E-commerce backend listening at http://localhost:${port}`);
});
