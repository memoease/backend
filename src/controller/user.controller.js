import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

import * as UserModel from "../model/user.model.js";
import * as FlashcardSetModel from "../model/flashcardSet.model.js";
import * as FlashcardModel from "../model/flashcard.model.js";
import * as LearnSessionModel from "../model/learnSession.model.js";
import * as GroupModel from "../model/group.model.js";

// Send Email
async function sendEmail(options) {
  // Craete a transporter object
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: `memoease "${process.env.EMAIL_USER}" `,
    to: process.env.EMAIL_CATCH_ALL || options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

// Register new User
export async function registerUser(req, res, next) {
  const { email, password, name } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await UserModel.getUserByEmail(email);

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

    const newUser = await UserModel.createUser(user);

    // Send an email with registration information and confirmation link
    const confirmationLink = `${process.env.BASE_URL}/user/confirm?token=${confirmationToken}`;
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
  } catch (error) {
    console.error(error);
    next(error);
  };
};

// Email Confirmation
export async function confirmEmail(req, res, next) {
  try {
    const { token } = req.query;

    // Find the user by the verification token
    const user = await UserModel.findUserByVerifyToken(token);

    // If the user is not found, return an error message
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid token or user not found." });
    }

    // If the user is found and successfully verified, update the user
    user.verify = true;

    await user.save();

    // Set success message and status in the URL
    const successMessage = `Congrats ${user.name}! You are now registered and can continue with the login to start learning.`;
    const status = "success";
    const redirectUrl = `${process.env.FRONTEND_PORT}/login?status=${status}&message=${encodeURIComponent(successMessage)}`;

    // Redirect to login page with success message and status in the URL
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Login User
export async function loginUser(req, res, next) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.getUserByEmail(email);

    // User input validation email/password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Wrong email or password!" });
    };
    // email confirmation validation
    if (!user.verify) {
      return res.status(401).json({
        error: `Email not confirmed for ${user.email}. Please confirm your email address.`,
      });
    };

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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
    });
    // Set a second cookie with user information and HTTP-only set to false
    res.cookie(
      "userInfo",
      JSON.stringify({ id: user._id, email: user.email, name: user.name }),
      {
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 3, // 3 hours
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain: process.env.FRONTEND_PORT
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
  };
};

// Validate Token
export async function validateToken(req, res, next) {
  try {
    // Check if the "authToken" exists in the cookie
    const authToken = req.cookies.authToken;

    if (!authToken) {
      return res.status(401).json({ error: "Unauthorized" });
    };

    // Verify and decode the JWT token
    // The decoded token (decoded) now contains the user data encoded in the payload.
    jwt.verify(authToken, process.env.JWT_SECRET);

    // Send a confirmation response indicating the user is authorized
    res.status(200).json({ message: "Authorized" });
  } catch (error) {
    next(error);
  };
};

// Logout User
export async function logoutUser(req, res, next) {
  try {
    // Delete Auth-Token-Cookie
    res.clearCookie("authToken");

    // Delete User-Info-Cookie
    res.clearCookie("userInfo");

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  };
};

// Update User
export async function updateUser(req, res, next) {
  const userId = req.params.id;
  const updates = req.body;

  try {
    // Get the current user data
    const currentUser = await UserModel.getUserById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    };

    // If updates include a new password, check if the old password is provided
    if (updates.password) {
      if (!updates.oldPassword) {
        return res
          .status(400)
          .json({ error: "Old password is required to change the password" });
      };

      // Check if the old password is correct
      const isOldPasswordValid = await bcrypt.compare(
        updates.oldPassword,
        currentUser.password
      );

      if (!isOldPasswordValid) {
        return res.status(401).json({ error: "Old password is incorrect" });
      };

      // Hash the new password
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      currentUser.password = hashedPassword;
    };

    // Update the user's name if provided
    if (updates.name) {
      currentUser.name = updates.name;
    };

    // Update user information in the database
    const updatedUser = await UserModel.updateUserById(userId, currentUser);

    // Create a response object with only the desired fields
    const responseObj = {};
    if (updates.name) {
      responseObj.name = updatedUser.name;
    };
    if (updates.password) {
      responseObj.passwordUpdateSuccess = true;
    };

    res.status(200).json(responseObj); // Respond with the response object
  } catch (error) {
    next(error);
  };
};

// Delete User
export async function deleteUser(req, res, next) {
  const userId = req.params.id;

  try {
    // Find all private sets of the user
    const userSets = await FlashcardSetModel.getSetsByUserId(userId);
    const privateSets = userSets.filter((set) => !set.isPublic);

    // Extract the IDs of the flashcards and sets from the private sets
    const cardIds = [];
    const setIds = privateSets.map((set) => set._id);

    for (const set of privateSets) {
      // Extract the IDs of the flashcards from the current set
      const currentCardIds = set.flashcards.map((card) => card._id);

      // Add the flashcard IDs to the overall cards array
      cardIds.push(...currentCardIds);
    };

    // Delete the flashcards for all collected card IDs
    await FlashcardModel.deleteManyCardsById(cardIds);

    // Delete all collected sets with their set IDs
    for (const setId of setIds) {
      await FlashcardSetModel.deleteSet(setId);
    };

    // Delete the learn sessions of the user
    await LearnSessionModel.deleteSessionsByUserId(userId);

    // Delete the user
    await UserModel.deleteUserById(userId);

    res.status(204).end(); // No content, indicating successful deletion
  } catch (error) {
    console.error(error);
    next(error);
  };
};
