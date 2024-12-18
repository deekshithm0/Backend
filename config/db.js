
const mongoose = require('mongoose')    
const dotenv = require('dotenv');

dotenv.config()

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connnected');
    } catch (error) {j
        console.error('MongoDB Connection Error')
        process.exit(1);
    }                     
};

module.exports = connectDB;