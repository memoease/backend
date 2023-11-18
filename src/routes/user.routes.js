import { Router } from "express";

import * as UserController from "../controller/user.controller.js";
import { requireAuth } from "../middleware/validateToken.js";
import { validateEmail, validateId } from "../middleware/ajvValidation.js";

const userRouter = Router();

// User Register
userRouter.post("/register", validateEmail, UserController.registerUser);
// Email Confirmation
userRouter.get("/confirm", UserController.confirmEmail);
// User Login
userRouter.post("/login", validateEmail, UserController.loginUser);

// Auth validation
userRouter.get("/authenticate", UserController.validateToken);

// Authenticated User Routes
userRouter.get("/logout", requireAuth, UserController.logoutUser);
userRouter.patch("/:id", validateId, requireAuth, UserController.updateUser);
userRouter.delete("/:id", validateId, requireAuth, UserController.deleteUser);

export default userRouter;
