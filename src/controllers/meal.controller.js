const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
const { time } = require('console');
const { json } = require('body-parser');
var jwt = require('jsonwebtoken');

const authenticateJWT = (req, res) => {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
    } else {
        res.sendStatus(403);
    }
};

const mealController = {

    //UC-301 Toevoegen maaltijd
    createMeal: (req, res) => {
        authenticateJWT(req, res);  //check if user is logged in
        jwt.verify(req.token, 'your-secret-key', function (err, data) {
            if (err) {
                res.sendStatus(403);
                console.log(err);
            } else {

                const meal = req.body;
                const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
                let today = new Date();

                let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

                // logger.info('Register user');
                logger.debug('Meal=', meal);
                //validate incoming user info
                try {
                    assert(typeof meal.name === 'string', 'name must be a string');
                    assert(typeof meal.description === 'string', 'description must be a string');
                    assert(typeof meal.price === 'number', 'price must be a number');
                    assert(typeof meal.maxAmountOfParticipants === 'number', 'maxParticipants must be a number');
                    assert(typeof meal.isActive === 'number', 'isActive must be a number');
                    assert(typeof meal.isVega === 'number', 'isVega must be a number');
                    assert(typeof meal.isVegan === 'number', 'isVegan must be a number');
                    assert(typeof meal.isToTakeHome === 'number', 'isToTakeHome must be a number');
                    assert(typeof meal.dateTime === 'string', 'dateTime must be a string');
                    assert(typeof meal.imageUrl === 'string', 'imageUrl must be a string');
                    assert(typeof meal.allergenes === 'string', 'allergenes must be a string');

                } catch (err) {
                    res.status(400).json({
                        status: 400,
                        message: err.message.toString(),
                        data: meal
                    });
                    return;
                }
                let sqlStatement = "INSERT INTO `meal`(`isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `createDate`, `updateDate`, `name`, `description`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);";
                const date = new Date().toISOString().slice(0, 19).replace("T", " ");
                const decoded = jwt.verify(req.token, 'your-secret-key');
                pool.getConnection(function (err, conn) {
                    // Do something with the connection
                    if (err) {
                        console.log('error', err);
                        next('error: ' + err.message);
                    }
                    if (conn) {
                        conn.query(sqlStatement, [
                            meal.isActive,
                            meal.isVegan,
                            meal.isVega,
                            meal.isToTakeHome,
                            meal.dateTime,
                            meal.maxAmountOfParticipants,
                            meal.price,
                            meal.imageUrl,
                            decoded.userId,
                            date,
                            date,
                            meal.name,
                            meal.description
                        ],
                            function (err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    next({
                                        code: 409,
                                        message: err.message
                                    });
                                }
                                if (results) {
                                    logger.info('Found', results.length, 'results');
                                    res.status(200).json({
                                        statusCode: 200,
                                        message: 'meal create endpoint',
                                        data: meal
                                    });
                                }
                            });
                        pool.releaseConnection(conn);
                    }
                });
            }
        });
    },

    //UC-302 wijzig maaltijd
    updateMeal: (req, res) => {
        authenticateJWT(req, res); // check if user is logged in
        jwt.verify(req.token, 'your-secret-key', function (err, data) {
            if (err) {
                res.sendStatus(403);
                console.log(err);
            } else {
                const decoded = jwt.verify(req.token, 'your-secret-key');
                const meal = req.body;
                const mealId = meal.id;
                logger.info('Update meal');
                logger.debug('id=', mealId);

                // Validate incoming user info
                try {
                    assert(typeof meal.id === 'number', 'id must be a number');
                    assert(typeof meal.name === 'string', 'name must be a string');
                    // ... validate other fields
                } catch (err) {
                    return res.status(400).json({
                        status: 400,
                        message: err.message.toString(),
                        data: meal
                    });
                }

                const date = new Date().toISOString().slice(0, 19).replace("T", " ");
                const allergenesString = meal.allergenes.toString();
                const sqlStatement = "UPDATE `meal` SET `isActive`=?,`isVega`=?,`isVegan`=?,`isToTakeHome`=?,`maxAmountOfParticipants`=?,`price`=?,`imageUrl`=?,`cookId`=?,`updateDate`=?,`name`=?,`description`=?,`allergenes` =? WHERE id = ?";
                const cooksql = "SELECT cookId FROM meal WHERE id = ?"
                pool.getConnection(function (err, conn) {
                    if (err) {
                        console.log('error', err);
                        return res.status(500).json({
                            status: 500,
                            message: 'Internal Server Error',
                            data: meal
                        });
                    }
                    conn.query(cooksql, [
                        mealId
                    ], function (err, results, fields) {
                        if (err) {
                            return res.status(400).json({
                                status: 400,
                                message: err.message.toString(),
                                data: meal
                            });
                        }
                        if (results.length > 0) {

                            try {
                                assert(results[0].cookId == decoded.userId, 'user is not authorized to update this meal');

                            } catch (err) {
                                return res.status(400).json({
                                    status: 400,
                                    message: err.message.toString(),
                                    data: meal
                                });
                            }
                        }
                    });
                });

                pool.getConnection(function (err, conn) {
                    if (err) {
                        console.log('error', err);
                        return res.status(500).json({
                            status: 500,
                            message: 'Internal Server Error',
                            data: meal
                        });
                    }

                    conn.query(sqlStatement, [
                        meal.isActive,
                        meal.isVega,
                        meal.isVegan,
                        meal.isToTakeHome,
                        meal.maxAmountOfParticipants,
                        meal.price,
                        meal.imageUrl,
                        decoded.userId,
                        date,
                        meal.name,
                        meal.description,
                        allergenesString,
                        mealId,
                    ], function (err, results, fields) {
                        conn.release(); // Release the connection back to the pool

                        if (err) {
                            return res.status(400).json({
                                status: 400,
                                message: err.message.toString(),
                                data: meal
                            });
                        }

                        if (results.affectedRows > 0) {
                            return res.status(200).json({
                                statusCode: 200,
                                message: 'meal update endpoint',
                                data: results
                            });
                        } else if (results.affectedRows === 0) {
                            return res.status(404).json({
                                statusCode: 404,
                                message: 'meal not found',
                                data: results
                            });
                        }
                    });
                });
            }
        });
    },

    //UC-303 opvragen maaltijden
    getAllMeals: (req, res, next) => {
        console.log('get all meals');
        let sqlStatement = "SELECT * FROM meal";
        pool.getConnection(function (err, conn) {
            if (err) {
                console.log("error", err);
                return next("error: " + err.message);
            }
            if (conn) {
                conn.query(sqlStatement, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        return next({
                            code: 409,
                            message: err.message,
                        });
                    }
                    if (results) {
                        res.status(200).json({
                            statusCode: 200,
                            message: "meal getAll endpoint",
                            data: results,
                        });
                        conn.release(); // Release the connection back to the pool
                        return; // Add this return statement to stop execution
                    }
                });
            }
        });
    },




    //UC-304 opvragen maaltijd bij ID
    getMealWithId: (req, res) => {
        const mealId = req.body.id;
        logger.info('Find meal');
        logger.debug('id=', mealId);

        const checkUserSql = 'SELECT * FROM meal WHERE id = ?';
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(checkUserSql, [mealId], (err, results) => {
                if (err) throw err;
                if (results.length > 0) {
                    const user = results[0];
                    res.status(200).json({
                        statusCode: 200,
                        message: 'meal id endpoint',
                        data: user
                    });
                    connection.release();
                    return user;
                } else {
                    res.status(404).json({
                        statusCode: 404,
                        message: 'meal not found',
                        data: mealId
                    })
                    connection.release();
                }
            });
        });
    },

    //UC-305 verwijderen maaltijd
    deleteMeal: (req, res) => {
        authenticateJWT(req, res); // check if user is logged in
        jwt.verify(req.token, 'your-secret-key', function (err, data) {
          if (err) {
            res.sendStatus(403);
            console.log(req.token);
            console.log(err);
          } else {
            const mealId = req.body.id;
            logger.debug('id=', mealId);
            logger.info('Delete meal');
      
            // validate incoming user info
            try {
              assert(typeof mealId === 'number', 'id must be a number');
            } catch (err) {
              return res.status(400).json({
                status: 400,
                message: err.message.toString(),
                data: mealId
              });
            }
      
            const sqlStatement = 'DELETE FROM meal WHERE id = ?';
            const checkCooksql = 'SELECT * FROM meal WHERE id = ? ';
            const decoded = jwt.verify(req.token, 'your-secret-key');
            console.log(decoded);
            pool.getConnection(function (err, conn) {
              // Do something with the connection
              if (err) {
                console.log('error', err);
                return next('error: ' + err.message);
              }
              if (conn) {
                conn.query(checkCooksql, [mealId], function (err, results, fields) {
                  if (err) {
                    logger.err(err.message);
                    return next({
                      code: 409,
                      message: err.message
                    });
                  }
                  if (results.length > 0) {
                    const meal = results[0];
                    console.log(meal);
                    console.log(results)
      
                    if (meal.cookId == decoded.userId) {
                      conn.query(sqlStatement, [mealId], function (err, results, fields) {
                        if (err) {
                          logger.err(err.message);
                          return next({
                            code: 409,
                            message: err.message
                          });
                        }
                        if (results.affectedRows == 0) {
                            console.log(results);
                          return res.status(404).json({
                            statusCode: 404,
                            message: 'meal not found',
                            data: mealId
                          });
                        }
                        if (results.affectedRows > 0) {
                          // logger.info('Found', results.length, 'results');
                          return res.status(200).json({
                            statusCode: 200,
                            message: 'meal delete endpoint',
                            data: results
                          });
                        }
                      });
                    } else {
                      return res.status(400).json({
                        statusCode: 403,
                        message: 'user is not authorized to delete this meal',
                        data: mealId
                      });
                    }
                  } else {
                    console.log(results);
                    return res.status(404).json({
                      statusCode: 404,
                      message: 'cook has no meal',
                      data: mealId
                    });
                  }
                });
                pool.releaseConnection(conn);
              }
            });
          }
        });
      }
      

}
module.exports = mealController;