const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
mongoose.set('strictQuery', true);
const connectToMongo = async () => {
    try {
        let db = await mongoose.connect(process.env.MONGO_URL);
        console.log(db.connection.host);
    } catch (error) {
        console.log(error);
    }

}
module.exports = connectToMongo 