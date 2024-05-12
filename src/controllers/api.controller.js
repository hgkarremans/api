const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');

const apiController = {

  //UC-101
  loginUser: (req, res) => {
    const { emailAdress, password } = req.body;
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    
    try {
      assert(emailAdress != null, "emailAdress must be provided in request");
      assert(password != null, "password must be provided in request");
      assert(typeof emailAdress === "string", "emailAdress must be a string");
      assert(typeof password === "string", "password must be a string");
      assert.match(emailAdress, emailRegex, "Email adress must be valid");
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: error.message.toString()
      });
    }
  
    const sqlStatement = "SELECT * FROM user WHERE emailAdress = ?";
    
    pool.getConnection((err, conn) => {
      if (err) {
        console.error("Error connecting to database:", err);
        return res.status(500).json({
          status: 500,
          message: "Internal server error"
        });
      }
  
      conn.query(sqlStatement, [emailAdress], (err, results, fields) => {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).json({
            status: 500,
            message: "Internal server error"
          });
        }
  
        if (results.length === 1) {
          const user = results[0];
          const storedPassword = user.password;
  
          // Compare the provided password with the stored hashed password
          bcrypt.compare(password, storedPassword, (err, passwordMatch) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return res.status(500).json({
                status: 500,
                message: "Internal server error"
              });
            }
  
            if (passwordMatch) {
              const userId = user.id;
              const token = jwt.sign({ userId }, "your-secret-key");
              return res.status(200).json({
                statusCode: 200,
                message: "User login endpoint",
                data: token
              });
            } else {
              return res.status(401).json({
                statusCode: 401,
                message: "User login endpoint",
                data: "Invalid credentials"
              });
            }
          });
        } else {
          return res.status(401).json({
            statusCode: 401,
            message: "User login endpoint",
            data: "Invalid credentials"
          });
        }
      });
      conn.release();
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