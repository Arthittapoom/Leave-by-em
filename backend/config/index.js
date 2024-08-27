// don't working
module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 3001,
  mongoDB: {
    password: process.env.DATABASE_PASSWORD,
    databaseUrl: process.env.DATABASE,
  },
  jwtConfig: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    cookiesExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
  },
  productionGmail: {
    username: process.env.GMAIL_USERNAME,
    password: process.env.GMAIL_PASSWORD,
  },
  testGmail: {
    username: process.env.USER_MAIL,
    password: process.env.USER_PASS,
  },
  otpToken: {
    token: process.env.OTP_TOKEN,
  },
  pageLimit: process.env.PAGE_LIMIT || 40,
};
