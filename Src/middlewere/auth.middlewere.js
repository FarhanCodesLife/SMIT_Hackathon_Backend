import jwt from 'jsonwebtoken';

export const authenticateUser = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Check if the token is prefixed with "Bearer "
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    // Verify the token using a promise-based approach
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        // Handle token-specific errors
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        }
        return res.status(403).json({ message: "Invalid token" });
      }

      // Attach user to the request object for further processing
      req.user = user;
      next();
    });
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
