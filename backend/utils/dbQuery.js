const mssql = require('mssql');

module.exports = class dbQuery {
  constructor() {
    this.config = {
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
    };
  }

  async connect() {
    try {
      let pool = await mssql.connect(this.config);
      return pool;
    } catch (err) {
      console.log('ERROR', err);
    }
  }
}