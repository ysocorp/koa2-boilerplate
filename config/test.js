const port = process.env.PORT || 3030;

module.exports = {
  name: 'API Test',
  port,
  api: `http://localhost:${port}`,
  nbChildProcess: 1,
  jsonwebtoken: {
    privateKey: 'MY-PRIVATE-KEY-USE-FOR-JWT-TO-CREATE-TOKEN-CONTAIN-USER-INFORMATIONS-TEST',
  },
  database: {
    url: 'mysql://api-base:api-base@localhost/apibase_test',
    dialectOptions: {
      ssl: false,
    },
  },
};
