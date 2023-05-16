const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const apiController = {

    //UC-101
    loginUser: (req, res) => {

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