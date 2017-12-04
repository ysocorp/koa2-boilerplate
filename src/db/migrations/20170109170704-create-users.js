module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      usergroup_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'usergroups',
          key: 'id',
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      last_name: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      birthday: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('users', ['usergroup_id'], {});
  },
  down: (queryInterface, Sequelize) => { // eslint-disable-line no-unused-vars
    return queryInterface.dropTable('users');
  },
};
