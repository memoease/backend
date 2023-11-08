import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  // To the group creation
  isAdmin: {
    type: Boolean,
    default: false, // Default user is not admin
  },
  groups: [
    {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
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
