const mongoose = require('mongoose');
const config = require('./appConfig');

const connectDB = async() => {
    try {
      // Sanitize and log the URI to confirm which DB is being used
      const safeMongoUri = config.mongo_uri ? config.mongo_uri.split('@')[1] || config.mongo_uri : 'Not Defined';
      console.log(`🔌 Attempting to connect to MongoDB: ${safeMongoUri}`);
      
      await mongoose.connect(config.mongo_uri, {});
      console.log("MongoDB connected Successfully");
    }
    catch(error){
        console.error("Error Connecting to MongoDB: ", error);
        process.exit(1);
    }
}

module.exports = connectDB;