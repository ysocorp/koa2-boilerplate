import { join as pathJoin } from 'path';
import { readdirSync } from 'fs';
import Koa from 'koa';
import koaMount from 'koa-mount';
import compress from 'koa-compress';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';
import cors from 'kcors';

import I18n from './middlewares/I18n';
import RouteBase from './RouteBase';
import addDefaultBody from './middlewares/addDefaultBody';
import handleError from './middlewares/handleError';
import logger from './middlewares/logger';
import notFound from './middlewares/notFound';

export default class RouteManager {
  routes = [];

  constructor({ routeParam, middlewares, path }) {
    this.routeParam = routeParam;
    this.middlewares = middlewares;
    this.path = path;
    this.i18n = I18n.instance;

    this.app = new Koa();
  }

  addMiddlewares(middlewares) {
    for (const elem of middlewares) {
      this.app.use(elem);
    }
  }

  getAllRoutes() {
    if (!this.routes.length) {
      readdirSync(this.path)
        .filter(file => file.endsWith('.js'))
        .forEach((file) => {
          const Route = require(pathJoin(this.path, file)).default;
          if (Route && Route.prototype instanceof RouteBase) {
            const route = new Route({
              app: this.app,
              routes: this.routes,
              ...this.routeParam,
            });
            this.routes.push(route);
          }
        });
    }
    return this.routes;
  }

  initRoutes() {
    if (!this.i18n.isInit) {
      this.i18n.init();
    }
    this.addMiddlewares([
      cors({ credentials: true }),
      helmet(),
      bodyParser(),
      I18n.middleware,
      logger,
      handleError,
      addDefaultBody,
      compress({}),
      ...this.middlewares,
    ]);

    const routes = this.getAllRoutes();
    for (const route of routes) {
      route.mount();
      this.app.use(koaMount('/', route.koaRouter.middleware()));
    }

    this.app.use(notFound);
  }
}
