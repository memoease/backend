import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

import * as UserModel from "../model/user.model.js";

// Send Email
async function sendEmail(options) {
  // Craete a transporter object
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
    // https://myaccount.google.com/lesssecureapps
  });

  // Define email options
  const mailOptions = {
    from: `memoease "${process.env.EMAIL_USER}" `,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
  const { email } = req.body;
}

// Register new User
export async function registerUser(req, res, next) {
  const { email, password, name } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        error: `User with this email "${email}" already exists!`,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique confirmation token with uuid
    const confirmationToken = uuidv4();

    // Create a user with the confirmation token
    const user = {
      email,
      password: hashedPassword,
      name,
      verify: false, // Mark as not verified initially
      verifyToken: confirmationToken, // Include the confirmation token
    };

    const newUser = await createUser(user);

    // Send an email with registration information and confirmation link
    const confirmationLink = `${process.env.APP_BASE_URL}/confirm?token=${confirmationToken}`;
    const mailOptions = {
      email,
      subject: "Registration confirmation",
      message: `Please confirm your email by clicking the following link: ${confirmationLink}`,
    };

    await sendEmail(mailOptions);

    // Respond with the newly created user's data
    const responseData = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };

    res.status(201).json(responseData);

    // Redirect to the login page
    res.redirect(`${process.env.BASE_URL}user/login`);
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

    // Create auth-token
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 3, // 3 hours
    });

    // Set HTTP-only cookie with the auth token
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 3, // 3 hours
    });

    // Set a second cookie with user information and HTTP-only set to false
    res.cookie(
      "userInfo",
      JSON.stringify({ id: user._id, email: user.email, name: user.name }),
      {
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 3, // 3 hours
      }
    );

    // Respond with user information
    res.status(200).json({
      id: user._id,
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
