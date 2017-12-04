import Sequelize from 'sequelize';
import moment from 'moment';

export const ENUM_TYPE = {
  CHANGE_PASSWORD: 'change_password',
  SINUP_VERIFICATION: 'signup_verification',
  CHANGE_EMAIL: 'change_email',
  LOGIN: 'user_login',
};
export const ENTITY_NAME = {
  USERS: 'users',
};

const Table = global.sequelize.define('tokens',
  {
    entity_id: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    entity_name: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    consumable_until: {
      type: Sequelize.DATE,
    },
    nb_consumable: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
  },
  {
    underscored: true,
  },
);

Table.associate = (models) => { // eslint-disable-line no-unused-vars
};
Table.isConsumable = async ({ entity_id, token, type }) => {
  const ref = await Table.findOne({ where: { entity_id, token, type } });
  return ref && (
    (ref.nb_consumable === null && ref.consumable_until >= moment()) ||
    (ref.consumable_until === null && ref.nb_consumable > 0) ||
    (ref.consumable_until >= moment() && ref.nb_consumable > 0)
  );
};
Table.consumeOne = async ({ token }) => {
  const ref = await Table.findOne({ where: { token } });
  ref.nb_consumable -= 1;
  return ref.save();
};
Table.checkAndConsume = async ({ entity_id, token, type, message_error }) => {
  const isConsumable = await Table.isConsumable({
    entity_id,
    token,
    type,
  });
  if (!isConsumable) {
    Table.throw(400, message_error);
  }
  await Table.consumeOne({ token });
};
Table.consumeAll = async ({ entity_id, type }) => {
  return Table.update({ nb_consumable: 0 }, {
    where: { entity_id, type },
  });
};
Table.createLogin = async ({ entity_id, token }) => {
  return Table.create({
    entity_id,
    entity_name: ENTITY_NAME.USERS,
    token,
    type: ENUM_TYPE.LOGIN,
  });
};

Table.enumType = ENUM_TYPE;

export default Table;
