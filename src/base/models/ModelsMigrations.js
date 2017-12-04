import { join as pathJoin } from 'path';
import Sequelize from 'sequelize';
import Umzug from 'umzug';
import Bluebird from 'bluebird';

export default class ModelsMigrations {
  constructor(sequelize) {
    this.client = sequelize;
  }

  _addMethod(client) {
    const queryInterface = client.getQueryInterface();

    queryInterface.bulkInsertAutoIncrement = async (tableName, data, options = {}) => {
      await queryInterface.bulkInsert(tableName, data, options);
      const query = `select setval('${tableName}_id_seq', (select max(id) from ${tableName}))`;
      await queryInterface.sequelize.query(query);
    };
  }

  _getUmzug({ tableName = 'migrations', folder = 'migrations', models }) {
    this._addMethod(this.client);

    return new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: this.client,
        tableName,
      },
      logging: console.log,
      migrations: {
        params: [this.client.getQueryInterface(), Sequelize, models],
        path: pathJoin(process.cwd(), 'src', 'db', folder),
        pattern: /^\d+[\w-]+\.js$/,
        wrap: (fun) => {
          if (fun.length === 4) {
            return Bluebird.promisify(fun);
          }
          return fun;
        },
      },
    });
  }

  async runMigartions() {
    const migrator = this._getUmzug({});
    return this.client.authenticate().then(() => migrator.up());
  }

  async runSeeders({ models, folder = 'seeders' }) {
    const migrator = this._getUmzug({ models, folder });
    return this.client.authenticate().then(() => migrator.up());
  }
}
