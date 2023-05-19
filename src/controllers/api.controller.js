const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
var jwt = require('jsonwebtoken');

const apiController = {

    //UC-101
    loginUser: async (req, res) => {

        const { emailAdress, password} = req.body;
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        // Validate incoming user login data
        try {
            assert(
                emailAdress != null,
                "emailaddress/password must be provided in request"
              );
              assert(
                password != null,
                "emailaddress/password must be provided in request"
              );
            assert(typeof emailAdress === 'string', 'emailAdress must be a string');
            assert.match(emailAdress, emailRegex, "Email address must be valid");
            assert(typeof password === 'string', 'password must be a string');
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: err.message.toString(),
                data: req.body
            });
            return;
        }
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
                        let user = results[0];
                        let userId = user.id;
                        const token = jwt.sign({emailAdress, userId}, 'your-secret-key', { expiresIn: '1h' });
                        
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