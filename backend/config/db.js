const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const targetUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood_care_db';

  try {
    // Attempt connecting to the configured MongoDB URI (local or Atlas)
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2500 // Fail fast if local MongoDB service is not running
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB at ${targetUri}. Error: ${err.message}`);
    console.log('[Database] Initializing embedded zero-config MongoDB instance for seamless college demonstration...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'blood_care_db'
        }
      });
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Embedded MongoDB Server running successfully at ${memoryUri}`);
      console.log('[Database] System is fully functional for live presentation and testing!');
      return conn;
    } catch (fallbackError) {
      console.error('[Database] Failed to initialize embedded MongoDB:', fallbackError.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
