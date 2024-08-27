const mssql = require('mssql')
const config = {
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  server: process.env.DATABASE_URL, // You can use 'localhost\\instance' to connect to named instance
  database: process.env.DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

// Connect to DB
mssql.connect(config)
  .then((con) => {
    // console.log(con.connections);
    console.log('connection successfully');
  })
  .catch((err) => console.log('ERROR', err));
