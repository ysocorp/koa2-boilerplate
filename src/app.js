import config from 'config';
import { join } from 'path';
import { App as AppBase } from 'koa-smart';
import {
  i18n,
  bodyParser,
  compress,
  cors,
  helmet,
  addDefaultBody,
  handleError,
  logger,
  RateLimit,
  RateLimitStores,
} from 'koa-smart/middlewares';


import db from './models';
import authentification from './middlewares/authentification';

export default class App extends AppBase {
  constructor() {
    super({ port: 3000 });
    this.addConfigEnv();
    RateLimit.defaultOptions({
        store: new RateLimitStores.Sequelize(db.sequelize),
    });
  }

  addConfigEnv() {
    if (config.env) {
      for (const key in config.env) {
        if (!process.env[key]) {
          process.env[key] = config.env[key];
        }
      }
    }
  }

  async start() {
    super.addMiddlewares([
      cors({ credentials: true }),
      helmet(),
      bodyParser(),
      i18n(this.app, {
        directory: join(__dirname, 'locales'),
        locales: ['en', 'fr'],
        modes: ['query', 'subdomain', 'cookie', 'header', 'tld'],
    }),
      logger,
      handleError,
      addDefaultBody,
      authentification,
      compress({}),
      RateLimit.middleware({ interval: { min: 1 }, max: 100 }),
    ]);

    const models = db.initModels();
    this.app.context.models = models;
    this.routeParam = { models };

    super.mountFolder(join(__dirname, 'routes'), '/');
    return super.start();
  }
}
