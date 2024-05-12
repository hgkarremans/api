const logger = require("../util/utils").logger;
const assert = require("assert");
const pool = require("../util/mysql-db");
const { time } = require("console");
const { json } = require("body-parser");
var jwt = require("jsonwebtoken");
const { parse } = require("path");

const mealController = {
  //UC-301 Toevoegen maaltijd
  createMeal: (req, res) => {
    jwt.verify(req.token, "your-secret-key", function (err, data) {
      if (err) {
        res.sendStatus(403);
        console.log(err);
      } else {
        const meal = req.body;
        let today = new Date();

        let time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();

        try {
          assert(typeof meal.name === "string", "name must be a string");
          assert(
            typeof meal.description === "string",
            "description must be a string"
          );
          assert(typeof meal.price === "number", "price must be a number");
          assert(
            typeof meal.maxAmountOfParticipants === "number",
            "maxParticipants must be a number"
          );
          assert(
            typeof meal.isActive === "number",
            "isActive must be a number"
          );
          assert(typeof meal.isVega === "number", "isVega must be a number");
          assert(typeof meal.isVegan === "number", "isVegan must be a number");
          assert(
            typeof meal.isToTakeHome === "number",
            "isToTakeHome must be a number"
          );
          assert(
            typeof meal.dateTime === "string",
            "dateTime must be a string"
          );
          assert(
            typeof meal.imageUrl === "string",
            "imageUrl must be a string"
          );
          assert(
            typeof meal.allergenes === "string",
            "allergenes must be a string"
          );
        } catch (err) {
          res.status(400).json({
            status: 400,
            message: err.message.toString(),
            data: meal,
          });
          return;
        }
        let sqlStatement =
          "INSERT INTO `meal`(`isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `createDate`, `updateDate`, `name`, `description`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);";
        const date = new Date().toISOString().slice(0, 19).replace("T", " ");
        const decoded = jwt.verify(req.token, "your-secret-key");
        pool.getConnection(function (err, conn) {
          // Do something with the connection
          if (err) {
            console.log("error", err);
            next("error: " + err.message);
          }
          if (conn) {
            conn.query(
              sqlStatement,
              [
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
                meal.description,
              ],
              function (err, results, fields) {
                if (err) {
                  console.log(err);
                  next({
                    code: 409,
                    message: err.message,
                  });
                }
                if (results) {
                  logger.info("Found", results.length, "results");
                  res.status(200).json({
                    statusCode: 200,
                    message: "meal create endpoint",
                    data: meal,
                  });
                }
              }
            );
            pool.releaseConnection(conn);
          }
        });
      }
    });
  },

  //UC-302 wijzig maaltijd
  updateMeal: (req, res) => {
    const id = parseInt(req.params.id);
    try {
      assert(
        typeof req.body.imageUrl === "string",
        "imageUrl must be a string"
      );
      assert(typeof req.body.name === "string", "name must be a string");
      assert(
        typeof req.body.description === "string",
        "description must be a string"
      );
      assert(
        typeof req.body.allergenes === "string",
        "allergenes must be a string"
      );
      assert(typeof req.body.price === "string", "price must be a string ");
      assert(
        typeof req.body.maxAmountOfParticipants === "number",
        "maxAmountOfParticipants must be a number"
      );
      assert(typeof req.body.isVega === "number", "isVega must be a number");
      assert(typeof req.body.isVegan === "number", "isVegan must be a number");
      assert(
        typeof req.body.isToTakeHome === "number",
        "isToTakeHome must be a number"
      );
      assert(
        typeof req.body.isActive === "number",
        "isActive must be a number"
      );
      assert(
        typeof req.body.dateTime === "string",
        "dateTime must be a string"
      );
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: error.message.toString(),
        data: req.body,
      });
      return;
    }
    sqlStatement = `UPDATE meal SET imageUrl = ?, name = ?, description = ?, allergenes = ?, price = ?, maxAmountOfParticipants = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, isActive = ?, dateTime = ? WHERE id = ? AND cookId = ?`;
    const decoded = jwt.verify(req.token, "your-secret-key");
    pool.getConnection(function (err, conn) {
      if (err) {
        console.log("error", err);
        return next("error: " + err.message);
      }
      if (conn) {
        conn.query(
          sqlStatement,
          [
            req.body.imageUrl,
            req.body.name,
            req.body.description,
            req.body.allergenes,
            req.body.price,
            req.body.maxAmountOfParticipants,
            req.body.isVega,
            req.body.isVegan,
            req.body.isToTakeHome,
            req.body.isActive,
            req.body.dateTime,
            id,
            decoded.userId,
          ],
          function (err, results, fields) {
            if (err) {
              console.log(err);
              return next({
                code: 409,
                message: err.message,
              });
            }
            if (results.affectedRows > 0) {
              logger.info("Found", results.length, "results");
              res.status(200).json({
                statusCode: 200,
                message: "meal update endpoint",
                data: results,
              });
            } else {
                console.log(results);
              res.status(404).json({
                status: 404,
                message: "No meal with this ID found or you are not the cook of this meal",
                data: id,
              });
            }
          }
        );
        pool.releaseConnection(conn);
      }
    });
  },

  //UC-303 opvragen maaltijden
  getAllMeals: (req, res, next) => {
    console.log("get all meals");
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
            conn.release(); 
            return; 
          }
        });
      }
    });
  },

  //UC-304 opvragen maaltijd bij ID
  getMealWithId: (req, res) => {
    const mealId = parseInt(req.params.id);

    try {
        assert (typeof mealId === 'number', 'id must be a number'); 
    } catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message.toString(),
            data: mealId
        });
        return;
    }
    sqlStatement = `SELECT * FROM meal WHERE id = ?`;
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log("error", err);
            return next("error: " + err.message);
        }
        if (conn) {
            conn.query(
                sqlStatement,
                [mealId],
                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        return next({
                            code: 409,
                            message: err.message,
                        });
                    }
                    if (results) {
                        logger.info("Found", results.length, "results");
                        res.status(200).json({
                            statusCode: 200,
                            message: "meal id endpoint",
                            data: results,
                        });
                    }
                }
            );
            pool.releaseConnection(conn);
        }
    });
  },

  //UC-305 verwijderen maaltijd
  deleteMeal: (req, res) => {
    const mealId = parseInt(req.params.id);

    try {
        assert(typeof mealId === 'number', 'id must be a number');
    } catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message.toString(),
            data: mealId
        });
        return;
    }
    const decoded = jwt.verify(req.token, "your-secret-key");
    
    sqlStatement = `DELETE FROM meal WHERE id = ? AND cookId = ?`;
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log("error", err);
            return next("error: " + err.message);
        }
        if (conn)
        {
            conn.query(
                sqlStatement,
                [mealId, decoded.userId],
                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        return next({
                            code: 409,
                            message: err.message,
                        });
                    }
                    if (results.affectedRows > 0) {
                        logger.info("Found", results.length, "results");
                        res.status(200).json({
                            statusCode: 200,
                            message: "meal delete endpoint",
                            data: results,
                        });
                    } else {
                        console.log(results);
                        res.status(404).json({
                            status: 404,
                            message: "No meal with this ID found or you are not the cook of this meal",
                            data: mealId
                        });
                    
                    }
                }
            );
            pool.releaseConnection(conn);
        }
    }
    );
   },
};
module.exports = mealController;
