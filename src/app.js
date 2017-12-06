import config from 'config';
import { join } from 'path';
import { App as AppBase } from 'koa-smart';
import { 
  I18n, 
  bodyParser, 
  compress, 
  cors, 
  helmet,
  addDefaultBody,
  handleError,
  logger,
  passport,
} from 'koa-smart/middlewares';


import db from './models';
import authentification from './middlewares/authentification';

export default class App extends AppBase {
  constructor() {
    super({ port: 3000 });
    this.addConfigEnv();
    this.i18n = new I18n({
      path: join(__dirname, 'locales'),
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
      this.i18n.middleware,
      logger,
      handleError,
      addDefaultBody,
      passport.initialize(),
      authentification,
      compress({}),
    ]);

    const models = db.initModels();
    this.routeParam = { models };

    super.mountFolder(join(__dirname, 'routes'), '/');
    return super.start();
  }
}
