import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();

import { connectToDb } from "./service/db.js";
import userRouter from "./routes/user.routes.js";
import groupRouter from "./routes/group.routes.js";
import flashcardSetRouter from "./routes/flashcardSet.routes.js"
import learnSessionRouter from "./routes/learnsession.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: process.env.FRONTEND_PORT,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
await connectToDb();

app.use("/user", userRouter);
app.use("/group", groupRouter);
app.use("/sets", flashcardSetRouter);
app.use("/session", learnSessionRouter);


//404 error handler
app.all("*", (req, res, next) => {
  const error = new Error("Not found");
  error.statusCode = 404;
  error.status = "fail";

  next(error);
});

//Global error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send({
    msg: err.message || "Internal Server Error",
    status: err.status || "error",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`😊 Server running on http://localhost:${process.env.PORT}/`);
});
