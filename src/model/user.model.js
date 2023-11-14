import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
  },
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verifyToken: {
    type: String,
  },
});

const User = model("User", userSchema);

export default User;

// Database communication separate from business logic, which is defined in controllers.

// User
// Register
export async function createUser(userData) {
  const newUser = new User(userData);
  return newUser.save();
}

// Login
export async function getUserByEmail(email) {
  return User.findOne({ email });
}

export async function getUserById(userId) {
  return User.findById(userId);
}

// Update
export async function updateUserById(userId, newData) {
  return User.findByIdAndUpdate(userId, newData, { new: true });
}

// Delete User
export async function deleteUserById(userId) {
  return User.findByIdAndDelete(userId);
}
