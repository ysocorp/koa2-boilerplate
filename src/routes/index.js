import passport from 'koa-passport';
import config from 'config';
import { join as pathJoin } from 'path';

import authentification from './middlewares/authentification';
import RouteManager from '../base/routes/RouteManager';

export default class AppRouteManager extends RouteManager {
  constructor(models) {
    super({
      routeParam: { models },
      middlewares: [
        passport.initialize(),
        authentification,
      ],
      path: __dirname,
    });

    this.app.context.models = models;
  }

  async start() {
    this.i18n.locales = ['fr_FR'];
    this.i18n.localeDefault = 'fr_FR';
    this.i18n.init(pathJoin(__dirname, '..', 'locales'));

    super.initRoutes();
    return this.app.listen(config.port, () => {
      console.log(`Runing ${config.name} Version=${config.version} on Port=${config.port}`);
    });
  }
}
