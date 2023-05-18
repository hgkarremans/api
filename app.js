const express = require('express')
const assert = require('assert');
const userRouters = require('./src/routes/user.routes');
const apiRouters = require('./src/routes/api.routes');
const mealRouters = require('./src/routes/meal.routes');
const jwt = require('jsonwebtoken');

const app = express()
const port = 3000

const authenticateJWT = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
};

app.use(express.json());


app.use('/api/user', userRouters);
app.use('/api', apiRouters);
app.use('/api/meal', authenticateJWT, mealRouters);


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
module.exports = app;