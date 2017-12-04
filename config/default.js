var packageJson = require('../package.json');

const port = process.env.PORT || 3001;

module.exports = {
  appName: 'My App',
  name: packageJson.name,
  version: packageJson.version,
  loginTokenVersion: '1',
  port,
  api: undefined,
  front: undefined,
  nbChildProcess: process.env.WEB_CONCURRENCY || 1,
  jsonwebtoken: {
    privateKey: process.env.JWT_KEY, // MY-PRIVATE-KEY-USE-FOR-JWT-TO-CREATE-TOKEN-CONTAIN-USER-INFORMATIONS
  },
  database: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false, // Outputting SQL to the console on execution of query
    dialectOptions: {
      ssl: true,
    },
  },
  email: {
    startSubject: '[My app] ',
    from: 'no-reply@mywebsite.com',
    send: true,
    htmlLog: false,
  },
  // all elem in env will be add to process.env object
  env: {
  },
  // onesignal push notification
  pushNotifications: {
    send: false,
    allowSendToAll: true,
    includePlayerIdsToAll: [''],
    displayLog: true,
    app_id: undefined,
    Authorization: undefined,
    templateIds: {}
  },
};
