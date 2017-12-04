import config from 'config';

import db from './models';
import AppRouteManager from './routes/index';

export default class App {
  constructor() {
    this.addConfigEnv();
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
    try {
      const models = db.initModels();
      const routeManager = new AppRouteManager(models);
      await routeManager.start();
    } catch (error) {
      console.log('[ERROR] :', error);
    }
  }
}
