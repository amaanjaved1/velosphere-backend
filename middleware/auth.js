import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    // Retrieve the token from the request's header
    let token = req.header("Authorization");

    // If the token is falsy (empty or undefined)
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    // Extract the actual token value
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      // User is the payload that was passed into the jwt.sign() method
      if (err) {
        return res.status(403).send("Invalid token");
      }
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
