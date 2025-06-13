import { mongoose } from './moduleLoader.js';
import { MONGODB_URI } from './config.js';

let cachedDb = null;

export const connectToDatabase = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const db = await mongoose.connect(MONGODB_URI, options);
  cachedDb = db;

  return db;
};