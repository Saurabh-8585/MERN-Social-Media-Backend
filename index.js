const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./database/db');
const auth = require('./routes/AuthRoute');
const post = require('./routes/PostRoute');
const checkOrigin = require('./middleware/ApiAuth');

dotenv.config();

connectToMongo();

const port = 5000;

const app = express();

app.use(express.json());
app.use(cors());
// app.use(checkOrigin);

app.use('/api/auth', auth);
app.use('/api/post', post);

app.listen(port, () => {
  console.log(`E-commerce backend listening at http://localhost:${port}`);
});
