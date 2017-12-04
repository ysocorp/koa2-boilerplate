
import sequelizeTransforms from 'sequelize-transforms';

import ErrorApp from '../utils/ErrorApp';
import utils, { validator } from '../utils';


function addFunction(Table) {
  Table.findByUuid = async (uuid, options = {}) => {
    options.where = options.where || {};
    options.where.uuid = uuid;
    return Table.findOne(options);
  };

  Table.updateOne = async (values, options) => {
    // individualHooks to allow call 'before / after' insteaceof 'beforeBulk / afterBulk'
    return Table.update(values, { ...options, individualHooks: true });
  };
  Table.updateById = async (id, values, options = {}) => {
    await Table.addHistory({ newObj: { ...values, id } });
    options.where = options.where || {};
    options.where.id = id;
    return Table.updateOne(values, options);
  };
  Table.updateByUuid = async (uuid, values, options = {}) => {
    options.where = options.where || {};
    options.where.uuid = uuid;
    return Table.updateOne(values, options);
  };
  Table.upsertOne = async (values, options) => {
    // individualHooks to allow call 'before / after' insteaceof 'beforeBulk / afterBulk'
    return Table.upsert(values, { ...options, individualHooks: true });
  };

  Table.destroyOne = async (options) => {
    // individualHooks to allow call 'before / after' insteaceof 'beforeBulk / afterBulk'
    return Table.destroy({ ...options, individualHooks: true });
  };
  Table.deleteById = async (id, options) => {
    options = options || {};
    options.where = options.where || {};
    options.where.id = id;
    return Table.destroyOne(options);
  };

  Table.throw = (status, message) => {
    throw new ErrorApp(status, message, true);
  };

  Table.putValidator = (name, regex, errorMessage) => {
    return validator.put({ key: Table, name, regex, errorMessage }).regex;
  };
  Table.getValidator = (name) => {
    return validator.get({ key: Table, name });
  };

  Table.toggle = async (option = {}, field) => {
    return Table.update({
      [field]: global.sequelize.literal(`NOT ${field}`),
    }, option);
  };
  Table.toggleById = async (id, field) => {
    return Table.toggle({ where: { id }, individualHooks: true }, field);
  };

  Table.increment = async (option = {}, field, nb = 1) => {
    return Table.update({
      [field]: global.sequelize.literal(`${field} + ${nb}`),
    }, option);
  };
  Table.incrementById = async (id, field, nb = 1) => {
    return Table.increment({ where: { id }, individualHooks: true }, field, nb);
  };

  Table.list = (option = {}) => {
    if (option.attributes === undefined) {
      option.attributes = [];
      for (const key in Table.attributes) {
        if (!['created_at', 'updated_at', 'deleted_at'].includes(key)) {
          option.attributes.push(key);
        }
      }
    }
    if (option.order === undefined) {
      if ('ord' in option.attributes) {
        option.order = ['ord', 'ASC'];
      } else if ('value' in option.attributes) {
        option.order = ['value', 'ASC'];
      }
    }
    return Table.findAll(option);
  };

  Table.deleteElem = (obj, name) => {
    obj[name] = undefined;
    if (obj.dataValues) {
      obj.dataValues[name] = undefined;
    }
    obj[name] = undefined;
  };
  Table.deleteElems = (obj, namesArray) => {
    namesArray.forEach(name => Table.deleteElem(obj, name));
  };

  if (!Table.getOpt) {
    Table.getOpt = (option = {}) => {
      return {
        model: Table,
        attributes: ['id', 'name'],
        ...option,
      };
    };
  }

  if (!Table.addHistory) {
    Table.addHistory = async ({ newObj }) => {
      if (!Table.options.historyOptions) {
        return;
      }
      if (!newObj.update_user_id) {
        Table.throw(400, 'Need update_user_id in tableHistory');
      }
      const historyOptions = Table.options.historyOptions;
      const tableHistory = Table.models[historyOptions.tableName];
      const toExcludes = ['id', 'created_at', 'updated_at', 'deleted_at', 'update_user_id', historyOptions.foreignKey];

      if (!newObj.id) { return null; }

      const oldObj = await Table.findById(newObj.id);
      if (oldObj) {
        const newHistory = {
          update_user_id: newObj.update_user_id,
          [historyOptions.foreignKey]: oldObj.id,
        };
        const allAttributes = Object.keys(tableHistory.attributes)
          .filter(elem => !toExcludes.includes(elem));
        for (const attr of allAttributes) {
          if (newObj[attr] !== undefined && oldObj[attr] !== newObj[attr]) {
            newHistory[attr] = newObj[attr];
          }
        }
        if (Object.keys(newHistory).length > 2) {
          return tableHistory.create(newHistory);
        }
        return null;
      }
      return tableHistory.create({
        ...newObj,
        id: undefined,
        [historyOptions.foreignKey]: newObj.id,
      });
    };
  }
}

function overloadFunction(Table) {
  async function includeHasMany(obj, paramIncludeHasMany) {
    const promises = [];
    for (const name in paramIncludeHasMany) {
      const paramSelect = paramIncludeHasMany[name];
      promises.push(obj['get' + utils.ucFirst(name)](paramSelect).then((data) => {
        obj[name] = data || [];
        obj.dataValues[name] = data || [];
      }));
    }
    await Promise.all(promises);
  }

  async function includeHasManyMulti(objs, paramIncludeHasMany) {
    const promises = [];
    for (const obj of objs) {
      promises.push(includeHasMany(obj, paramIncludeHasMany));
    }
    await Promise.all(promises);
  }
  // OVERLOAD
  Table.originalFindOne = Table.findOne;
  Table.findOne = async (option = {}) => {
    const result = await Table.originalFindOne(option);
    if (result && option.include_hasMany) {
      await includeHasMany(result, option.include_hasMany);
    }
    return result;
  };
  // OVERLOAD
  Table.originalFindAll = Table.findAll;
  Table.findAll = async (option = {}) => {
    const results = await Table.originalFindAll(option);
    if (option.include_hasMany) {
      await includeHasManyMulti(results, option.include_hasMany);
    }
    return results;
  };
}

export default function tranformTable(Table) {
  addFunction(Table);
  overloadFunction(Table);

  const customSequelizeTransforms = {
    transformToNullIfEmpty: (val, definition) => {
      if (definition.transformToNullIfEmpty && !val) {
        return null;
      }
      return val;
    },
  };
  sequelizeTransforms(Table, customSequelizeTransforms);
}
