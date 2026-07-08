import jwt from "jsonwebtoken";

export function signToken(user, sessionId) {
  return jwt.sign({ id: user._id, role: user.role, sessionId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}
