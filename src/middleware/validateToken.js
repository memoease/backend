import jwt from "jsonwebtoken";

// User identification based on the token and routes requests to authorized users while denying access to unauthorized users.
export const requireAuth = (req, res, next) => {
  // Check if the "authToken" exists in the cookie
  const authToken = req.cookies.authToken;

  try {
    // Verify and decode the JWT token
    // The decoded token (decoded) now contains the user data encoded in the payload.
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    // Add user data from the token to the request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
