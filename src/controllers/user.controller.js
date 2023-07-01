const database = require('../util/mysql-db');
const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
const { type } = require('os');
var jwt = require('jsonwebtoken');
const { log } = require('console');

const authenticateJWT = (req, res) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
  } else {
    res.sendStatus(403);
  }
};

const userController = {

  //UC-201
  createUser: (req, res) => {
    const user = req.body;
  
    logger.debug('User=', user);
  
    try {
      assert(typeof user.firstName === 'string', 'firstName must be a string');
      assert(typeof user.lastName === 'string', 'lastName must be a string');
      assert(typeof user.isActive === 'number', 'isActive must be a boolean');
      assert(typeof user.emailAdress === 'string', 'emailAdress must be a string');
      assert(typeof user.password === 'string', 'password must be a string');
      assert(typeof user.phoneNumber === 'string', 'phoneNumber must be a string');
      // assert(typeof user.roles === 'string', 'roles must be a string');
      assert(typeof user.street === 'string', 'street must be a string');
      assert(typeof user.city === 'string', 'city must be a string');
    } catch (err) {
      return res.status(400).json({
        status: 400,
        message: err.message.toString(),
        data: user
      });
    }
    //roles eruit gehaald
    const sqlStatement = "INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber,  street, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const checkEmailSql = 'SELECT COUNT(*) AS count FROM user WHERE emailAdress = ?';
  
    pool.getConnection((err, connection) => {
      if (err) throw err;
  
      connection.query(checkEmailSql, [user.emailAdress], (err, results) => {
        if (err) {
          connection.release();
           console.log(err);
           logger.err(err.message);
          return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            data: user
          });
        }
  
        const count = results[0].count;
        if (count === 0) {
          connection.query(sqlStatement, [user.firstName, user.lastName, user.isActive, user.emailAdress, user.password, user.phoneNumber, user.roles, user.street, user.city], (err, results) => {
            connection.release();
            if (err) {
              console.log(err);
              return res.status(500).json({
                status: 500,
                message: 'Internal Server Error',
                data: user
              });
            }
            return res.status(200).json({
              statusCode: 200,
              message: 'User register endpoint',
              data: user
            });
          });
        } else {
          connection.release();
          return res.status(400).json({
            statusCode: 400,
            message: 'Email already exists',
            data: user
          });
        }
      });
    });
  },
  
  

  //uc-202
  getAllUsers: (req, res, next) => {

    if (req.body.isActive == 0) {
      let sqlStatement = 'SELECT * FROM `user` WHERE isActive = 0';
      // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.

      pool.getConnection(function (err, conn) {
        // Do something with the connection
        if (err) {
          console.log('error', err);
          next('error: ' + err.message);
        }
        if (conn) {
          conn.query(sqlStatement, function (err, results, fields) {
            if (err) {
              logger.err(err.message);
              next({
                code: 409,
                message: err.message
              });
            }
            if (results) {
              // logger.info('Found', results.length, 'results');
              res.status(200).json({
                statusCode: 200,
                message: 'User getAll endpoint inactive users',
                data: results
              });
            }
          });
          pool.releaseConnection(conn);
        }
      });
    }
    else if (req.body.isActive == 1) {
      let sqlStatement = 'SELECT * FROM `user` WHERE isActive = 1';
      // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.

      pool.getConnection(function (err, conn) {
        // Do something with the connection
        if (err) {
          console.log('error', err);
          next('error: ' + err.message);
        }
        if (conn) {
          conn.query(sqlStatement, function (err, results, fields) {
            if (err) {
              logger.err(err.message);
              next({
                code: 409,
                message: err.message
              });
            }
            if (results) {
              // logger.info('Found', results.length, 'results');
              res.status(200).json({
                statusCode: 200,
                message: 'User getAll endpoint active users',
                data: results
              });
            }
          });
          pool.releaseConnection(conn);
        }
      });
    }
    else {
      let sqlStatement = 'SELECT * FROM `user`';
      // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.

      pool.getConnection(function (err, conn) {
        // Do something with the connection
        if (err) {
          console.log('error', err);
          next('error: ' + err.message);
        }
        if (conn) {
          conn.query(sqlStatement, function (err, results, fields) {
            if (err) {
              logger.err(err.message);
              next({
                code: 409,
                message: err.message
              });
            }
            if (results) {
              // logger.info('Found', results.length, 'results');
              res.status(200).json({
                statusCode: 200,
                message: 'User getAll endpoint',
                data: results
              });
            }
          });
          pool.releaseConnection(conn);
        }
      });
    }
  },

  //uc 203
  getUserProfile: (req, res) => {
    authenticateJWT(req, res);  //check if user is logged in
    jwt.verify(req.token, 'your-secret-key', function (err, data) {
      if (err) {
        console.log('Token in usermethod: '  + req.token);
        res.sendStatus(403);
        console.log(err);
      } else {
        
        const decoded = jwt.verify(req.token, 'your-secret-key');
        const checkUserSql = 'SELECT * FROM user INNER JOIN meal ON meal.cookId=user.id WHERE user.id=?';
        logger.info('Find user');
        logger.debug('Id=', decoded.userId);
        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(checkUserSql, [decoded.userId], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
              const user = results[0];
              res.status(200).json({
                statusCode: 200,
                message: 'User profile endpoint',
                data: user
              });
              connection.release();
              
            } else {
              res.status(200).json({
                statusCode: 200,
                message: 'User empty profile endpoint',
                data: null
              });
              connection.release();
            }
          });
        });
      }
    });

  },

  //UC-204
  getUserWithId: (req, res) => {
  
    const id = req.body.id;
    logger.debug('Id=', id);

    try {
      assert(typeof id === 'number', 'id must be a number');
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: error.message.toString(),
        data: id
      });
      return;
    }
    const checkUserSql = 'SELECT * FROM user WHERE id = ?';


    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(checkUserSql, [id], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
          const user = results[0];
          res.status(200).json({
            statusCode: 200,
            message: 'User id endpoint',
            data: user
          });
          connection.release();
          return user;
        } else {
          const error = new Error(`User with ID ${id} not found`);
          res.status(404).json({
            statusCode: 404,
            message: 'User not found',
            data: id
          })
          connection.release();
        }
      });
    });
  },
  //UC-205
  updateUser: (req, res) => {
    authenticateJWT(req, res);  //check if user is logged in
    jwt.verify(req.token, 'your-secret-key', function (err, data) {
      if (err) {
        res.sendStatus(403);
        console.log(err);
      } else {
        const user = req.body;
        const decoded = jwt.verify(req.token, 'your-secret-key');

        logger.info('Update user');
        logger.debug('User=', user);

        //validate incoming user info

        try {

          assert(typeof user.id === 'number', 'id must be a number');
          assert(user.id == decoded.userId, 'id must be the same as the logged in user')
          assert(typeof user.firstName === 'string', 'firstName must be a string');
          assert(typeof user.lastName === 'string', 'lastName must be a string');
          assert(typeof user.emailAdress === 'string', 'emailAdress must be a string');
        } catch (err) {
          res.status(400).json({
            status: 400,
            message: err.message.toString(),
            data: user
          });
          return;
        }

        const checkUserSql = 'SELECT * FROM user WHERE id = ?';
        const sqlStatement = "UPDATE user SET firstName = '" + user.firstName + "', lastName = '" + user.lastName + "', emailAdress = '" + user.emailAdress + "' WHERE id = " + user.id;

        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(checkUserSql, [user.id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
              connection.query(sqlStatement, [user.firstName, user.lastName, user.email, user.id], (err, results) => {
                if (err) throw err;
                console.log(`User with ID ${user.id} updated successfully`);
                res.status(200).json({
                  statusCode: 200,
                  message: 'User update endpoint',
                  data: user
                });
                connection.release();
              });
            } else {
              const error = new Error(`User with ID ${user.id} not found`);
              console.error(error);
              res.status(404).json({
                statusCode: 404,
                message: 'User not found',
                data: user
              });
              connection.release();

            }
          });
        });
      }
    });
  },
  deleteUser: (req, res) => {
    authenticateJWT(req, res);  //check if user is logged in
    jwt.verify(req.token, 'your-secret-key', function (err, data) {
      if (err) {
        res.sendStatus(403);
        console.log(err);
      } else {
        const id = req.body.id;
        const decoded = jwt.verify(req.token, 'your-secret-key');
        logger.info('Delete user');
        logger.debug('Id=', id);
        try {
          assert(typeof id === 'number', 'id must be a number');
          assert(id == decoded.userId, 'id must be the same as the logged in user')

        } catch (error) {
          res.status(400).json({
            status: 400,
            message: error.message.toString(),
            data: id
          });
          return;
        }

        const checkUserSql = 'SELECT * FROM user WHERE id = ?';
        let sqlStatement = "DELETE FROM user WHERE id = " + id;

        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(checkUserSql, [id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
              connection.query(sqlStatement, [id], (err, results) => {
                if (err) throw err;
                console.log(`User with ID ${id} deleted successfully`);

                res.status(200).json({
                  statusCode: 200,
                  message: 'User delete endpoint',
                  data: id
                });
                connection.release();
              });
            } else {
              const error = new Error(`User with ID ${id} not found`);
              console.error(error);
              res.status(404).json({
                statusCode: 404,
                message: 'User not found',
                data: id
              });
              connection.release();

            }
          });
        });
      }
    });
  }
};


module.exports = userController;
