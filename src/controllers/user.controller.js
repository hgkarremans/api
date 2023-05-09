const database = require('../util/mysql-db');
const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const userController = {

  //UC-201
  createUser: (req, res) => {
    const user = req.body;

    logger.info('Register user');
    logger.debug('User=', user);
    //validate incoming user info
    try {
      assert(typeof user.firstName === 'string', 'firstName must be a string');
      assert(
        typeof user.emailAdress === 'string',
        'emailAdress must be a string'
      );
    } catch (err) {
      res.status(400).json({
        status: 400,
        message: err.message.toString(),
        data: user
      });
      return;
    }

    let sqlStatement = "INSERT INTO user (firstName, lastName, emailAdress) VALUES ('" + user.firstName + "', '" + user.lastName + "', '" + user.emailAdress + "')";

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
              code: 400,
              message: err.message
            });
          }
          if (results) {
            logger.info('Inserted', results.length, 'user');
            res.status(200).json({
              statusCode: 200,
              message: 'User register endpoint',
              data: user
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },

  //uc-202
  getAllUsers: (req, res, next) => {
    logger.info('Get all users');

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
            logger.info('Found', results.length, 'results');
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
  },

  //uc 203
  // nog niet af



  //UC-204
  getUserWithId: (req, res) => {
    const id = req.body.id;

    logger.info('Find user');
    logger.debug('Id=', id);

    let sqlStatement = "SELECT * FROM user WHERE id = " + id;

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
              code: 400,
              message: err.message
            });
          }
          if (results) {
            logger.info('Found user');
            res.status(200).json({
              statusCode: 200,
              message: 'User id endpoint',
              data: results
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },
  //UC-205
  updateUser: (req, res) => {

    const user = req.body;

    logger.info('Update user');
    logger.debug('User=', user);

    let sqlStatement = "UPDATE user SET firstName = '" + user.firstName + "', lastName = '" + user.lastName + "', emailAdress = '" + user.emailAdress + "' WHERE id = " + user.id;

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
              code: 400,
              message: err.message
            });
          }
          if (results) {
            logger.info('Updated', results.length, 'user');
            res.status(200).json({
              statusCode: 200,
              message: 'User update endpoint',
              data: user
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },
  deleteUser: (req, res) => {
    const id = req.body.id;

    logger.info('Delete user');
    logger.debug('Id=', id);

    let sqlStatement = "DELETE FROM user WHERE id = " + id;

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
              code: 400,
              message: err.message
            });
          }
          if (results) {
            logger.info('Deleted user');
            res.status(200).json({
              statusCode: 200,
              message: 'User delete endpoint',
              data: results
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  }
};


module.exports = userController;
