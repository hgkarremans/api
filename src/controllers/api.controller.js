const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
var jwt = require('jsonwebtoken');

const apiController = {

    //UC-101
    loginUser: async (req, res) => {
        // Extract user login data from the request body
        const { emailAdress, password } = req.body;

        try {
            const conn = await pool.getConnection(); // Wait for the connection promise to resolve
            const result = await conn.query('SELECT * FROM user WHERE emailAdress  = ? AND password = ?', [emailAdress, password]);
            conn.release();
          
            if (result.length === 1) {
              // Generate JWT and send it back to the client
              const token = jwt.sign({ username }, 'your-secret-key');
              res.json({ token });
            } else {
              res.status(401).json({ message: 'Invalid credentials' });
            }
          } catch (error) {
            console.error('Error executing the query: ', error);
            res.status(500).json({ message: 'Internal server error' });
          }

        

        // // Retrieve user data from the database
        // const conn = pool.getConnection();
        // const result = await conn.query('SELECT * FROM user WHERE emailAdress  = ? AND password = ?', [emailAdress, password]);
        // conn.release();

        // if (result.length === 1) {
        //     // Generate JWT and send it back to the client
        //     const token = jwt.sign({ username }, 'your-secret-key');
        //     res.json({ token });
        // } else {
        //     res.status(401).json({ message: 'Invalid credentials' });
        // }
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