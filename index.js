import connectToMongo from "./database/db.js";


import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

dotenv.config()

const port = 5000

const app = express()

// create application/json parser
// app.use(bodyParser.json())
// create application/x-www-form-urlencoded parser
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(express.urlencoded({ extended: true }))


connectToMongo()
app.use(express.json())
app.use(cors());

app.listen(port, () => {
    console.log(`E-commerce backend listening at http://localhost:${port}`)
})
