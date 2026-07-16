const mongoose = require('mongoose');
const { MONGODB_URI } = require('./keys');

const connectMainDatabase = async (uri = MONGODB_URI) => {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1
    });

    console.log('Main MongoDB connection established');
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
};

const createDynamicConnection = async (uri) => {
  if (!uri) {
    throw new Error('A target database URI is required');
  }

  const connection = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 5,
    minPoolSize: 1
  });

  await connection.asPromise();
  console.log(`Dynamic connection established to ${uri}`);
  return connection;
};

const closeDynamicConnection = async (connection) => {
  if (connection && typeof connection.close === 'function') {
    await connection.close();
  }
};

module.exports = {
  connectMainDatabase,
  createDynamicConnection,
  closeDynamicConnection
};
