const express = require('express')
const assert = require('assert');
const userRouters = require('./src/routes/user.routes');

const app = express()
const port = 3000

app.use(express.json());


app.get('/api/info', (req, res) => {
    res.status(201).json({
        status: 201,
        message: 'Server info-endpoint',
        data: {
            studentName: 'Hans Gerard Karremans',
            studentNumber: 2188909,
            description: 'Welkom bij de server API van de share a meal.'
        }
    });
});
app.use('/api/users', userRouters);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
module.exports = app;