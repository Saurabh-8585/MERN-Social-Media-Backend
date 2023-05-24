import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const URL = process.env.MONGO_URL
mongoose.set('strictQuery', true)

 const connectToMongo = async () => {
    try {
        let db =await mongoose.connect(URL);
        console.log(db.connection.host);
    } catch (error) {
        console.log(error);
    }

}
export default connectToMongo;