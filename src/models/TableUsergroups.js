import Sequelize from 'sequelize';

export const GROUPS = {
  ADMIN_ID: 1,
  CLIENT_ID: 2,
};

const Table = global.sequelize.define('usergroups',
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      trim: true,
    },
  },
  {
    underscored: true,
  },
);
Table.associate = (models) => { // eslint-disable-line no-unused-vars
};
Table.groups = GROUPS;

export default Table;
