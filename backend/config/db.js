const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/dynamic-products';
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('');
        console.error('Please ensure MongoDB is running. Options:');
        console.error('  1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
        console.error('  2. Use MongoDB Atlas (free): https://www.mongodb.com/atlas');
        console.error('     Set MONGO_URI in .env to your Atlas connection string');
        console.error('');
        process.exit(1);
    }
};

module.exports = connectDB;
