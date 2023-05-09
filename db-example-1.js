// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'shareameal',
  port: 3306
});

// simple query
connection.query(
  'SELECT * FROM meal',
  function (err, results, fields) {
    if (err) {
      console.log(err.sqlMessage, ' ', err.errno, '', err.code);
    }
    console.log('results: ', results);
  }
);

connection.end();
