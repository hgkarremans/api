const database = require("../util/mysql-db");
const logger = require("../util/utils").logger;
const assert = require("assert");
const pool = require("../util/mysql-db");
const { type } = require("os");
var jwt = require("jsonwebtoken");
const { log } = require("console");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userController = {
  //UC-201
  createUser: (req, res) => {
    const user = req.body;

    logger.debug("User=", user);

    try {
      assert(typeof user.firstName === "string", "firstName must be a string");
      assert(typeof user.lastName === "string", "lastName must be a string");
      assert(typeof user.isActive === "number", "isActive must be a boolean");
      assert(
        typeof user.emailAdress === "string",
        "emailAdress must be a string"
      );
      assert(typeof user.password === "string", "password must be a string");
      assert(
        typeof user.phoneNumber === "string",
        "phoneNumber must be a string"
      );
      assert(typeof user.street === "string", "street must be a string");
      assert(typeof user.city === "string", "city must be a string");
    } catch (err) {
      return res.status(400).json({
        status: 400,
        message: err.message.toString(),
        data: user,
      });
    }

    const sqlStatement =
      "INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const checkEmailSql =
      "SELECT COUNT(*) AS count FROM user WHERE emailAdress = ?";

    pool.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(checkEmailSql, [user.emailAdress], (err, results) => {
        if (err) {
          connection.release();
          console.log(err);
          logger.err(err.message);
          return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            data: user,
          });
        }

        const count = results[0].count;
        if (count === 0) {
          // Hash the password
          bcrypt.hash(
            user.password,
            saltRounds,
            function (err, hashedPassword) {
              if (err) {
                connection.release();
                console.log(err);
                return res.status(500).json({
                  status: 500,
                  message: "Internal Server Error",
                  data: user,
                });
              }

              // Store the hashed password in the database
              connection.query(
                sqlStatement,
                [
                  user.firstName,
                  user.lastName,
                  user.isActive,
                  user.emailAdress,
                  hashedPassword,
                  user.phoneNumber,
                  user.street,
                  user.city,
                ],
                (err, results) => {
                  connection.release();
                  if (err) {
                    console.log(err);
                    return res.status(500).json({
                      status: 500,
                      message: "Internal Server Error",
                      data: user,
                    });
                  }
                  return res.status(200).json({
                    statusCode: 200,
                    message: "User register endpoint",
                    data: user,
                  });
                }
              );
            }
          );
        } else {
          connection.release();
          return res.status(400).json({
            statusCode: 400,
            message: "Email already exists",
            data: user,
          });
        }
      });
    });
  },

  //uc-202
  getAllUsers: (req, res, next) => {
    const validFilters = [
      "firstName",
      "lastName",
      "street",
      "city",
      "isActive",
      "emailAdress",
    ];
    const { ...filters } = req.body;

    if (Object.keys(filters).length > 2) {
      res.status(400).json({
        status: 400,
        message: "Maximum of 2 filters allowed",
        data: filters,
      });
      return;
    }

    let sqlStatement = "SELECT * FROM user";

    if (Object.keys(filters).length > 0) {
      const validFiltersKeys = Object.keys(filters).filter((key) =>
        validFilters.includes(key)
      );
      if (validFiltersKeys.length > 0) {
        const whereClause = validFiltersKeys
          .map((key) => `${key} = ?`)
          .join(" AND ");
        sqlStatement += ` WHERE ${whereClause}`;
      } else {
        res.status(400).json({
          status: 400,
          message: "Invalid filter keys",
          data: filters,
        });
        return;
      }
    }

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        res.status(500).json({
          status: 500,
          message: "Internal server error",
          data: null,
        });
        return;
      }
      connection.query(sqlStatement, Object.values(filters), (err, results) => {
        connection.release();
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: null,
          });
          return;
        }
        res.status(200).json({
          statusCode: 200,
          message: "User getAll endpoint",
          data: results,
        });
      });
    });

  },

  //uc 203
  getUserProfile: (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id);
    const decoded = jwt.verify(req.token, "your-secret-key");
    if (decoded.userId != id) {
      res.status(403).json({
        status: 403,
        message: "Forbidden",
        data: id,
      });
    } else {
      sqlStatement = "SELECT * FROM user WHERE id = ?";
      pool.getConnection(function (err, conn) {
        if (err) {
          console.log("error", err);
          next("error: " + err.message);
        }
        if (conn) {
          conn.query(sqlStatement, [id], function (err, results, fields) {
            if (err) {
              logger.err(err.message);
              next({
                code: 409,
                message: err.message,
              });
            }
            if (results.length > 0) {
              res.status(200).json({
                statusCode: 200,
                message: "User profile endpoint",
                data: results,
              });
            } else {
              res.status(404).json({
                statusCode: 404,
                message: "User not found",
                data: id,
              });
            }
          });
          pool.releaseConnection(conn);
        }
      });
    }
  },

  //UC-204
  getUserWithId: (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      // Check if the conversion was successful
      res.status(400).json({
        status: 400,
        message: "id must be a number",
        data: req.params.id,
      });
      return;
    }

    const checkUserSql = "SELECT * FROM user WHERE id = ?";
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(checkUserSql, [id], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
          const user = results[0];
          res.status(200).json({
            statusCode: 200,
            message: "User id endpoint",
            data: user,
          });
          connection.release();
          return user;
        } else {
          const error = new Error(`User with ID ${id} not found`);
          res.status(404).json({
            statusCode: 404,
            message: "User not found",
            data: id,
          });
          connection.release();
        }
      });
    });
  },
  //UC-205
  updateUser: (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id);

    // Extract email from the request body
    const { emailAdress } = req.body;

    try {
      assert(typeof emailAdress === "string", "emailAdress must be a string");
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: error.message,
        data: req.body,
      });
      return;
    }

    if (isNaN(id)) {
      // Check if the conversion was successful
      res.status(400).json({
        status: 400,
        message: "id must be a number",
        data: req.params.id,
      });
      return;
    }
    const decoded = jwt.verify(req.token, "your-secret-key");
    if (id != decoded.userId) {
      res.status(403).json({
        status: 403,
        message: "Forbidden",
        data: id,
      });
      return;
    }

    // Check if emailAdress is unique
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        res.status(500).json({
          status: 500,
          message: "Internal server error",
          data: null,
        });
        return;
      }

      // Perform query to check if emailAdress already exists
      connection.query(
        "SELECT COUNT(*) AS count FROM user WHERE emailAdress = ? AND id != ?",
        [emailAdress, id],
        (err, results) => {
          if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({
              status: 500,
              message: "Internal server error",
              data: null,
            });
            return;
          }

          // Check if emailAdress already exists
          if (results[0].count > 0) {
            res.status(400).json({
              status: 400,
              message: "Email address is already in use",
              data: emailAdress,
            });
            connection.release();
            return;
          }

          // If email is unique, proceed with updating the user
          const sqlStatement =
            "UPDATE user SET firstName = ?, lastName = ?, isActive = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ? WHERE id = ?";
          connection.query(
            sqlStatement,
            [
              req.body.firstName,
              req.body.lastName,
              req.body.isActive,
              req.body.emailAdress,
              req.body.password,
              req.body.phoneNumber,
              req.body.street,
              req.body.city,
              id,
            ],
            (err, results) => {
              if (err) {
                console.error("Error executing query:", err);
                res.status(500).json({
                  status: 500,
                  message: "Internal server error",
                  data: null,
                });
                return;
              }
              console.log(`User with ID ${id} updated successfully`);
              res.status(200).json({
                statusCode: 200,
                message: "User update endpoint",
                data: req.body,
              });
              connection.release();
            }
          );
        }
      );
    });

  },
  //UC-206
  deleteUser: (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id);

    if (isNaN(id)) {
      // Check if the conversion was successful
      res.status(400).json({
        status: 400,
        message: "id must be a number",
        data: req.params.id,
      });
      return;
    }
    const decoded = jwt.verify(req.token, "your-secret-key");
    if (id != decoded.userId) {
      res.status(403).json({
        status: 403,
        message: "Forbidden",
        data: id,
      });
      return;
    }
    const sqlStatement = "DELETE FROM user WHERE id = ?";
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(sqlStatement, [id], (err, results) => {
        if (err) throw err;
        console.log(`User with ID ${id} deleted successfully`);
        res.status(200).json({
          statusCode: 200,
          message: "User delete endpoint",
          data: id,
        });
        connection.release();
      });
    });
  },
};

module.exports = userController;
