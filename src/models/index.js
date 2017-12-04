import ModelManager from '../base/models/ModelManager';

let _instance = null;

export class AppModelManager extends ModelManager {
  constructor() {
    super();
    this.path = __dirname;
  }

  static get instance() {
    if (_instance === null) {
      _instance = new AppModelManager();
    }
    return _instance;
  }
}

export default AppModelManager.instance;
