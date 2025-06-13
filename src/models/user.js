import '../utils/moduleResolver.js';
import { mongoose } from '../utils/moduleLoader.js';
import passwordUtils from '../utils/passwordUtils.js';
import { connectToDatabase } from '../utils/db.js';

// Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create User model
const UserModel = mongoose.model('User', userSchema);

/**
 * Find user by username
 */
export const findByUsername = async (username) => {
  await connectToDatabase();
  return UserModel.findOne({ username });
};

/**
 * Get all users (excluding passwords)
 */
export const getAll = async () => {
  await connectToDatabase();
  return UserModel.find({}, { password: 0 });
};

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  await connectToDatabase();
  
  // Hash password
  userData.password = await passwordUtils.hashPassword(userData.password);
  
  // Create and save user
  const user = new UserModel(userData);
  return user.save();
};

/**
 * Verify user password
 */
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return passwordUtils.verifyPassword(plainPassword, hashedPassword);
};