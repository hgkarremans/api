const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
const { time } = require('console');
const { json } = require('body-parser');
var jwt = require('jsonwebtoken');

const mealController = {

    //UC-301 Toevoegen maaltijd
    createMeal: (req, res) => {

        const meal = req.body;
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
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: err.message.toString(),
                data: meal
            });
            return;
        }

        let sqlStatement = "INSERT INTO meal (name, description, price, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, imageUrl, cookId, createDate, allergenes) VALUES ('" + meal.name + "', '" + meal.description + "', '" + meal.price + "', '" + meal.isActive + "', '" + meal.isVega + "', '" + meal.isVegan + "', '" + meal.isToTakeHome + "', '" + meal.dateTime + "', '" + meal.maxAmountOfParticipants + "', '" + meal.imageUrl + "', '" + meal.cookId + "', '" + time + "', '" + meal.allergenes + "')";

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
                            message: 'meal create endpoint',
                            data: meal
                        });
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    },

    //UC-302 wijzig maaltijd
    updateMeal: (req, res) => {

        jsonMeal = req.body;
        mealId = jsonMeal.id;
        console.log(mealId);
        console.log(jsonMeal);
        logger.info('Update meal');
        logger.debug('id=', mealId);
        let today = new Date();
        let currentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        //validate incoming user info
        try {
            assert(typeof jsonMeal.name === 'string', 'name must be a string');
            assert(typeof jsonMeal.description === 'string', 'description must be a string');
            assert(typeof jsonMeal.price === 'number', 'price must be a number');
            assert(typeof jsonMeal.maxAmountOfParticipants === 'number', 'maxParticipants must be a number');
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: err.message.toString(),
                data: jsonMeal
            });
        }

        const sqlStatement = 'UPDATE meal SET name = ?, description = ?, price = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, imageUrl = ?, cookId = ?, updateDate = ?, allergenes = ? WHERE id = ?';
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(sqlStatement, [jsonMeal.name, jsonMeal.description, jsonMeal.price, jsonMeal.isActive, jsonMeal.isVega, jsonMeal.isVega, jsonMeal.isToTakeHome, jsonMeal.dateTime, jsonMeal.maxAmountOfParticipants, jsonMeal.imageUrl, jsonMeal.cookId, currentTime, jsonMeal.allergenes], function (err, results, fields) {
                    if (err) {

                        res.status(400).json({
                            status: 400,
                            message: err.message.toString(),
                            data: jsonMeal
                        });
                    }
                    if (results) {
                        // logger.info('Found', results.length, 'results');
                        res.status(200).json({
                            statusCode: 200,
                            message: 'meal update endpoint',
                            data: results
                        });
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    },

    //UC-303 opvragen maaltijden
    getAllMeals: (req, res) => {
        jwt.verify(req.token, 'your-secret-key', function (err, data) {
            if (err) {
                res.sendStatus(403);
                console.log(req.token);
                console.log(err);
            } else {
                console.log(req.token);
                let sqlStatement = "SELECT * FROM meal";

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
                                    message: 'meal getAll endpoint',
                                    data: results
                                });
                            }
                        });
                        pool.releaseConnection(conn);
                    }
                });
            }

        });


    },

    //UC-304 opvragen maaltijd bij ID
    getMealWithId: (req, res) => {

        jwt.verify(req.token, 'your-secret-key', function (err, data) {
            if (err) {
                res.sendStatus(403);
                console.log(req.token);
                console.log(err);
            } else {
                const mealId = req.body.mealId;
                console.log(mealId);

                console.log(req.params.mealId);
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
                            const error = new Error(`Meal with ID ${mealId} not found`);
                            console.error(error);
                            res.status(404).json({
                                statusCode: 404,
                                message: 'meal not found',
                                data: mealId
                            })
                            connection.release();
                        }
                    });
                });
            }
        });

    },

    //UC-305 verwijderen maaltijd
    deleteMeal: (req, res) => {
        jwt.verify(req.token, 'your-secret-key', function (err, data) {
            if (err) {
                res.sendStatus(403);
                console.log(req.token);
                console.log(err);
            } else {
                const mealId = req.body.id;
                console.log(mealId);
                logger.debug('id=', mealId);
                logger.info('Delete meal');

                const sqlStatement = 'DELETE FROM meal WHERE id = ?';
                pool.getConnection(function (err, conn) {
                    // Do something with the connection
                    if (err) {
                        console.log('error', err);
                        next('error: ' + err.message);
                    }
                    if (conn) {
                        conn.query(sqlStatement, [mealId], function (err, results, fields) {
                            if (err) {
                                logger.err(err.message);
                                next({
                                    code: 409,
                                    message: err.message
                                });
                            }
                            if (results.affectedRows == 0) {
                                res.status(404).json({
                                    statusCode: 404,
                                    message: 'meal not found',
                                    data: mealId
                                });
                            }
                            if (results.affectedRows > 0) {
                                // logger.info('Found', results.length, 'results');
                                res.status(200).json({
                                    statusCode: 200,
                                    message: 'meal delete endpoint',
                                    data: results
                                });
                            }

                        });
                        pool.releaseConnection(conn);
                    }
                });
            }
        });
    },

}
module.exports = mealController;