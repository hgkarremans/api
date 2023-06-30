const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
var jwt = require('jsonwebtoken');
require('dotenv').config();


const apiController = {

    //UC-101
    loginUser: (req, res) => {
        const { emailAdress, password } = req.body;
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      
        // Validate incoming user login data
        try {
          assert(emailAdress != null, "emailaddress must be provided in request");
          assert(password != null, "password must be provided in request");
          assert(typeof emailAdress === "string", "emailAdress must be a string");
          assert.match(emailAdress, emailRegex, "Email address must be valid");
          assert(typeof password === "string", "password must be a string");
        } catch (err) {
          res.status(400).json({
            status: 400,
            message: err.message.toString(),
          });
          return;
        }
      
        let sqlStatement = "SELECT * FROM user WHERE emailAdress = ? AND password = ?";
      
        pool.getConnection(function (err, conn) {
          if (err) {
            console.log("error", err);
            next("error: " + err.message);
            return;
          }
      
          if (conn) {
            conn.query(sqlStatement, [emailAdress, password], function (err, results, fields) {
              if (err) {
                logger.err(err.message);
                console.log(err);
                res.status(409).json({
                  code: 409,
                  message: err.message,
                });
                return;
              }
      
              if (results.length === 1) {
                let user = results[0];
                let userId = user.id;
                const token = jwt.sign({ userId }, "your-secret-key");
      
                res.status(200).json({
                  statusCode: 200,
                  message: "User login endpoint",
                  data: token,
                });
              } else {
                res.status(401).json({
                  statusCode: 401,
                  message: "User login endpoint",
                  data: "Invalid credentials",
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