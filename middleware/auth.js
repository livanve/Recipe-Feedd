const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  console.log("Received Token:", token);  // Log the token

  try {
    const decoded = jwt.verify(token, 'mysecretkey'); // Replace with your actual secret key
    console.log("Decoded Token:", decoded);  // Log the decoded token

    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);  // Log the error message
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
