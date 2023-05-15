const database = require('../util/mysql-db');
const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const userController = {

  //UC-201
  createUser: (req, res) => {
    const user = req.body;

    // logger.info('Register user');
    logger.debug('User=', user);
    //validate incoming user info
    try {
      assert(typeof user.firstName === 'string', 'firstName must be a string');
      assert(
        typeof user.emailAdress === 'string',
        'emailAdress must be a string'
      );
      assert(typeof user.lastName === 'string', 'lastName must be a string');
    } catch (err) {
      res.status(400).json({
        status: 400,
        message: err.message.toString(),
        data: user
      });
      return;
    }

    let sqlStatement = "INSERT INTO user (firstName, lastName, emailAdress) VALUES ('" + user.firstName + "', '" + user.lastName + "', '" + user.emailAdress + "')";
    const checkEmailSql = 'SELECT COUNT(*) AS count FROM user WHERE emailAdress = ?'


    pool.getConnection((err, connection) => {
      if (err) throw err;

      // execute the check email SQL statement
      connection.query(checkEmailSql, [user.emailAdress], (err, results) => {
        if (err) throw err;
        const count = results[0].count;
        if (count === 0) {
          connection.query(sqlStatement, [user.emailAdress], (err, results) => {
            if (err) throw err;
            res.status(200).json({
              statusCode: 200,
              message: 'User register endpoint',
              data: user
            });
          });
        } else {
          res.status(400).json({
            statusCode: 400,
            message: 'Email already exists',
            data: user
          });
        }
        connection.release();
      });
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
  },

  //uc 203
  // functie nog niet gerealiseerd
  getUserProfile: (req, res) => {

    res.status(403).json({
      statusCode: 403,
      message: 'Functie nog niet gerealiseerd',
      data: 'Not implemented'

    });
  },

    //UC-204
    getUserWithId: (req, res) => {
      const id = req.body.id;

      logger.info('Find user');
      logger.debug('Id=', id);
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
            console.error(error);
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

        const user = req.body;

        logger.info('Update user');
        logger.debug('User=', user);

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
      },
        deleteUser: (req, res) => {
          const id = req.body.id;

          logger.info('Delete user');
          logger.debug('Id=', id);

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
  };


  module.exports = userController;
