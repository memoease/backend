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
