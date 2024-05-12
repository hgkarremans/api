const authenticateJWT = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      req.token = bearerToken;
      // Call next to pass control to the next middleware or route handler
      next();
    } else {
      res.sendStatus(403);
    }
  };
  
  module.exports = {
    authenticateJWT,
  };
  