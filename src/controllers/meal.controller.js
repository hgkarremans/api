const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const mealController = {

    //UC-301 Toevoegen maaltijd
    createMeal: (req, res) => {

    },

    //UC-302 wijzig maaltijd
    updateMeal: (req, res) => {

    },

    //UC-303 opvragen maaltijden
    getAllMeals: (req, res) => {

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
    },

    //UC-304 opvragen maaltijd bij ID
    getMealWithId: (req, res) => {

    },

    //UC-305 verwijderen maaltijd
    deleteMeal: (req, res) => {

    }



}
module.exports = mealController;