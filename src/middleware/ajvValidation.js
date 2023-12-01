import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

const idSchema = {
  type: "string",
  minLength: 24,
  maxLength: 24,
};

const emailSchema = {
  type: "string",
  format: "email",
};

const passwordSchema = {
  type: "string",
  minLength: 8,
  maxLength: 72,
};

export function validateId(req, res, next) {
  const isValid = ajv.validate(idSchema, req.params.id);

  if (!isValid) {
    return res.status(400).json({ error: "Invalid ID!" });
  }

  next();
}

export function validateEmail(req, res, next) {
  const isValid = ajv.validate(emailSchema, req.body.email);

  if (!isValid) {
    return res.status(400).json({ error: "Invalid email!" });
  }

  next();
}

export function validatePassword(req, res, next) {
  const isValid = ajv.validate(passwordSchema, req.body.password);

  if (!isValid) {
    return res.status(400).json({
      error: "Invalid password! Password must be at least 8 characters long.",
    });
  }

  next();
}
