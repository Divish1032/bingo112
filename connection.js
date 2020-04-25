const mysql = require('mysql');

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bingo'
  });
  
  
  db.connect(function(err) {
    if (err) throw err;
    console.log('MySQL Sever Connected');
    
  });

  module.exports = db;