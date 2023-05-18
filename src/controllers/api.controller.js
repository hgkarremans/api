const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
var jwt = require('jsonwebtoken');

const apiController = {

    //UC-101
    loginUser: async (req, res) => {
        // Extract user login data from the request body
        const { emailAdress, password } = req.body;
        let sqlStatement = 'SELECT * FROM user WHERE emailAdress  = ? AND password = ?'

        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(sqlStatement,[emailAdress, password], function (err, results, fields) {
                    if (err) {
                        logger.err(err.message);
                        next({
                            code: 409,
                            message: err.message
                        });
                    }
                    if (results.length == 1) {
                        const token = jwt.sign({ emailAdress }, 'your-secret-key');
                        res.status(200).json({
                            statusCode: 200,
                            message: 'User login endpoint',
                            data: "Token: " + token
                        });
                    }
                    if (results.length == 0) {
                        res.status(401).json({
                            statusCode: 401,
                            message: 'User login endpoint',
                            data: 'Invalid credentials'
                        });
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    },

    getInfo: (req, res) => {
        res.status(201).json({
            status: 201,
            message: 'Server info-endpoint',
            data: {
                studentName: 'Hans Gerard Karremans',
                studentNumber: 2188909,
                description: 'Welkom bij de server API van share a meal.'
            }
        });
    }


}
module.exports = apiController;