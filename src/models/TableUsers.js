import Sequelize from 'sequelize';

import { crypto, validator } from '../base/utils';
import { GROUPS } from './TableUsergroups';

const tableName = 'users';

const Table = global.sequelize.define(tableName,
  {
    usergroup_id: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      trim: true,
      validate: { is: validator.get('email') },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    first_name: {
      type: Sequelize.STRING,
      defaultValue: '',
      trim: true,
    },
    last_name: {
      type: Sequelize.STRING,
      defaultValue: '',
      trim: true,
    },
    birthday: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
  },
  {
    underscored: true,
    paranoid: true,

    hooks: {
      beforeCreate: async (instance, options) => {
        return Table.beforeCreateUpdate(instance, options, true);
      },
      beforeUpdate: async (instance, options) => {
        return Table.beforeCreateUpdate(instance, options, false);
      },
    },
  },
);
Table.associate = (models) => {
  Table.belongsTo(models.usergroups, { foreignKey: 'usergroup_id' });
};
Table.beforeCreateUpdate = async (instance, options, isCreate) => {
  const { fields } = options;
  if (isCreate && fields.includes('email')) {
    const exist = await Table.findOne({ where: { email: instance.email } });
    if (exist) {
      Table.throw(400, global.__('Email is already in use'));
    }
  }
  if (isCreate || fields.includes('password')) {
    const { args, msg } = validator.get('password');
    if (!instance.password.match(args)) {
      Table.throw(400, msg);
    }
    instance.password = crypto.encryptPassword(instance.password);
  }
};
Table.getOptClient = (opt = { where: {}, attributes: [], include: [] }) => {
  const { where = {}, attributes = [], include = [] } = opt;
  return {
    ...opt,
    model: Table,
    attributes: ['id', 'email', 'first_name', 'last_name', ...attributes],
    include: [{
      model: Table.models.enterprises,
      attributes: ['id', 'name'],
    }, ...include],
    where: {
      usergroup_id: GROUPS.CLIENT_ID,
      ...where,
    },
  };
};
Table.getDataUserById = async (id) => {
  return Table.findById(id, {
    attributes: ['id', 'usergroup_id', 'email', 'first_name', 'last_name'],
  });
};
Table.changePassword = async ({ id, password }) => {
  return Table.updateOne({ password }, { where: { id } });
};
Table.changeEmail = async ({ id, email }) => {
  return Table.updateOne({ email }, { where: { id } });
};
Table.isAdmin = ({ usergroup_id }) => {
  return usergroup_id === GROUPS.ADMIN_ID;
};
Table.isClient = ({ usergroup_id }) => {
  return usergroup_id === GROUPS.CLIENT_ID;
};
Table.includeDefault = (opt = { as: 'user' }) => {
  return {
    ...opt,
    model: Table,
    attributes: ['id', 'first_name', 'last_name'],
  };
};

export default Table;
