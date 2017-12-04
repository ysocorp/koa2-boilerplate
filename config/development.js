module.exports = {
  api: 'http://localhost:3001',
  front: 'http://localhost:4200',
  nbChildProcess: 2,
  isDev: true,
  database: {
    url: 'postgres://postgres:@127.0.0.1/apibase',
    logging: true,
    dialectOptions: {
      ssl: false,
    },
  },
  jsonwebtoken: {
    privateKey: 'MY-PRIVATE-KEY-USE-FOR-JWT-TO-CREATE-TOKEN-CONTAIN-USER-INFORMATIONS',
  },
  email: {
    startSubject: '[My app DEV] ',
    htmlLog: true,
  },
};
