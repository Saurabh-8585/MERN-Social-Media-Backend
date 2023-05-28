const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./database/db');
const auth = require('./routes/AuthRoute');
const post = require('./routes/PostRoute');


dotenv.config()

const port = 5000

const app = express()

// create application/json parser
app.use(bodyParser.json())
// create application/x-www-form-urlencoded parser
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(express.urlencoded({ extended: true }))
connectToMongo()

app.use(express.json())
app.use(cors());


app.use('/api/auth', auth);
app.use('/api/post', post);

app.listen(port, () => {
    console.log(`E-commerce backend listening at http://localhost:${port}`)
})
