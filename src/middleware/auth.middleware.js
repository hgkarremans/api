const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const bearerHeader = req.headers.authorization;

    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, "your-secret-key", (err, decoded) => {
            if (err) {
                res.sendStatus(403); // Forbidden
            } else {
                req.token = bearerToken;
                req.userId = decoded.userId; // Assuming userId is stored in the token
                next(); // Call next to pass control to the next middleware or route handler
            }
        });
    } else {
        res.sendStatus(403); // Forbidden
    }
};

module.exports = {
    authenticateJWT
};
