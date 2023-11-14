import { Router } from "express";


import * as UserController from "../controller/user.controller.js";
import { requireAuth } from "../middleware/validateToken.js";
import { validateEmail, validateId } from "../middleware/ajvValidation.js";

const userRouter = Router();

// User Routes
userRouter.post("/register", validateEmail, UserController.registerUser);
userRouter.post("/login", validateEmail, UserController.loginUser);

// Authenticated User Routes
userRouter.get("/logout", requireAuth, UserController.logoutUser);
userRouter.patch("/:id", validateId, requireAuth, UserController.updateUser);
userRouter.delete("/:id", validateId, requireAuth, UserController.deleteUser);


// EMAIL CONFIRMATION LINK
userRouter.get("/confirm", UserController.confirmEmail);
export default userRouter;



