console.log("Database Entered");

/////////////////////  DataBase Connection ///////////////////////////////////////////////////////////////

var pg = require('pg');

var config = {
  user: 'postgres',
  database: 'Calculess',
  password: 'minorks',
  host: 'localhost',
  port: 5432,    // Default PostgreSQL port is 5432, change if necessary
  max: 10000,
  idleTimeoutMillis: 30000
};

var pool = new pg.Pool(config);

pool.connect(function (err, client, done) {
  if (err) {
    return console.error('error fetching client from pool', err);
  }
  console.log("Connection Successfully Established with Postgres");
  done();
  console.log("DB connected"+"\n   \n==================================================")
});


module.exports = pool;