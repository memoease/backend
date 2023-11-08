import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import * as UserModel from "../model/user.model.js";

// Register new User
export async function registerUser(req, res, next) {
  const { email, password, name } = req.body;

  try {
    const existingUser = await UserModel.getUserByEmail(email);
    // check email dublicate
    if (existingUser) {
      return res.status(409).json({
        error: `User with this email "${email}" already exists!`,
      });
    }

    // password encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = { email, password: hashedPassword, name };
    // create a new user in the database and get the user object with an assigned ID
    const newUser = await UserModel.createUser(user);

    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    // create auth token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 3, // 3 hours
    });
    // respond with token in httpOnly-cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 3, // 3 hours
    });
    // respond with newUser Object
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
}

// Login User
export async function loginUser(req, res, next) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.getUserByEmail(email);
    // User input validation email/password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Wrong email or password!" });
    }

    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    // create auth-token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 3, // 3 hours
    });

    // respond with token in httpOnly-cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 3, // 3 hours
    });

    // response with Userinformation
    res.status(200).json({
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
}

// Logout User
export async function logoutUser(req, res, next) {
  try {
    // serverside clear auth-token-cookie
    res.clearCookie("authToken");

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
}

// Update User
export async function updateUser(req, res, next) {
  const userId = req.params.id;
  const updates = req.body;

  try {
    // Get the current user data
    const currentUser = await UserModel.getUserById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's password if provided
    if (updates.password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      currentUser.password = hashedPassword;
    }

    // Update the user's name if provided
    if (updates.name) {
      currentUser.name = updates.name;
    }

    // Update user information in the database
    const updatedUser = await UserModel.updateUserById(userId, currentUser);

    res.status(200).json(updatedUser); // Respond with the updated user object
  } catch (error) {
    next(error);
  }
}

// Delete User
export async function deleteUser(req, res, next) {
  const userId = req.params.id;

  try {
    // Delete user from the database
    const deletedUser = await UserModel.deleteUserById(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send(); // No content, indicating successful deletion
  } catch (error) {
    next(error);
  }
}
